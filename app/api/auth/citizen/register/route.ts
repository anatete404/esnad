import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { COOKIES, createCitizenToken, hashPassword } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  fullName: z.string().min(3, 'الاسم قصير جدًا'),
  nationalId: z.string().regex(/^\d{14}$/, 'الرقم القومي لازم 14 رقم'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  phone2: z.string().optional(),
  email: z.string().email('البريد غير صحيح').optional().or(z.literal('')),
  password: z.string().min(8, 'كلمة السر 8 أحرف على الأقل'),
  gov: z.string().min(2, 'المحافظة مطلوبة'),
  center: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  capacity: z.string().default('مالك'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.citizen.findUnique({
      where: { nationalId: data.nationalId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'الرقم القومي مسجل بالفعل، يمكنك تسجيل الدخول' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(data.password)

    const citizen = await prisma.citizen.create({
      data: {
        nationalId: data.nationalId,
        fullName: data.fullName,
        phone: data.phone,
        phone2: data.phone2 || null,
        email: data.email || null,
        passwordHash,
        gov: data.gov,
        center: data.center,
        village: data.village,
        address: data.address,
        capacity: data.capacity,
        isVerified: true,
      },
    })

    const token = await createCitizenToken(citizen.id)
    const cookieStore = await cookies()
    cookieStore.set(COOKIES.CITIZEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    await logAudit({
      action: 'CITIZEN_REGISTER',
      entity: 'Citizen',
      entityId: citizen.id,
      newValue: { nationalId: citizen.nationalId, fullName: citizen.fullName },
    })

    return NextResponse.json({
      success: true,
      citizen: {
        id: citizen.id,
        fullName: citizen.fullName,
        nationalId: citizen.nationalId,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[register]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
