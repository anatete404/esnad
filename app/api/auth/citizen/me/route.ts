import { NextResponse } from 'next/server'
import { getCitizenSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getCitizenSession()

  if (!session) {
    return NextResponse.json({ error: 'غير مسجّل' }, { status: 401 })
  }

  const citizen = await prisma.citizen.findUnique({
    where: { id: session.id },
    select: { id: true, fullName: true, nationalId: true },
  })

  if (!citizen) {
    return NextResponse.json({ error: 'غير مسجّل' }, { status: 401 })
  }

  return NextResponse.json({
    citizen: {
      id: citizen.id,
      fullName: citizen.fullName,
      nationalId: citizen.nationalId,
    },
  })
}
