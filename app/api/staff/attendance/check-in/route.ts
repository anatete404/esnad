import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const notes = typeof body.notes === 'string' ? body.notes.slice(0, 500) : null

    const active = await prisma.attendance.findFirst({
      where: { userId: session.id, checkOutAt: null },
      orderBy: { checkInAt: 'desc' },
    })

    if (active) {
      return NextResponse.json(
        { error: 'لديك تسجيل حضور مفتوح بالفعل. يجب تسجيل الانصراف أولاً.' },
        { status: 400 },
      )
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: session.id,
        checkInAt: new Date(),
        notes,
      },
    })

    await logAudit({
      userId: session.id,
      action: 'ATTENDANCE_CHECK_IN',
      entity: 'Attendance',
      entityId: attendance.id,
    })

    return NextResponse.json({ success: true, attendance }, { status: 201 })
  } catch (err) {
    console.error('[check-in]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
