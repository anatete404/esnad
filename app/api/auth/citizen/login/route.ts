import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { COOKIES, createCitizenToken, verifyPassword } from '@/lib/auth'

const schema = z.object({
  nationalId: z.string().regex(/^\d{14}$/),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json())

    const citizen = await prisma.citizen.findUnique({
      where: { nationalId: data.nationalId },
    })

    if (!citizen) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }

    const valid = await verifyPassword(data.password, citizen.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }

    const token = await createCitizenToken(citizen.id)
    const cookieStore = await cookies()
    cookieStore.set(COOKIES.CITIZEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return NextResponse.json({ success: true, fullName: citizen.fullName })
  } catch {
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
  }
}
