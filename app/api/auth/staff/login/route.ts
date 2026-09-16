import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { COOKIES, createUserToken, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  email: z.string().email('البريد غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json())

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { role: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }

    const valid = await verifyPassword(body.password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }

    const token = await createUserToken({
      userId: user.id,
      roleKey: user.role.key as any,
      branchId: user.branchId,
    })

    const cookieStore = await cookies()
    cookieStore.set(COOKIES.USER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.nameAr,
      },
    })
  } catch {
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
  }
}
