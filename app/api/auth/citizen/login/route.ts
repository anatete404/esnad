import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { COOKIES, createCitizenToken, verifyPassword } from '@/lib/auth'

const bodySchema = z.object({
  identifier: z.string().min(1, 'مطلوب'),
  password: z.string().min(1, 'مطلوب'),
})

export async function POST(req: Request) {
  try {
    const data = bodySchema.parse(await req.json())
    const identifier = data.identifier.trim()
    const isNationalId = /^\d{14}$/.test(identifier)

    let citizens: Awaited<ReturnType<typeof prisma.citizen.findMany>> = []

    if (isNationalId) {
      const citizen = await prisma.citizen.findUnique({
        where: { nationalId: identifier },
      })
      if (citizen) citizens = [citizen]
    } else {
      citizens = await prisma.citizen.findMany({
        where: { email: identifier.toLowerCase() },
      })
    }

    if (citizens.length === 0) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }

    const matches = []
    for (const citizen of citizens) {
      if (await verifyPassword(data.password, citizen.passwordHash)) {
        matches.push(citizen)
      }
    }

    if (matches.length === 0) {
      return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 })
    }

    if (matches.length > 1) {
      return NextResponse.json(
        {
          error: 'يوجد أكثر من حساب بنفس البيانات. من فضلك استخدم الرقم القومي.',
          requiresNationalId: true,
        },
        { status: 409 },
      )
    }

    const citizen = matches[0]

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
