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

    if (!active) {
      return NextResponse.json(
        { error: 'لا يوجد تسجيل حضور مفتوح' },
        { status: 400 },
      )
    }

    const checkOutAt = new Date()
    const durationMinutes = Math.round(
      (checkOutAt.getTime() - active.checkInAt.getTime()) / 60000,
    )

    const updated = await prisma.attendance.update({
      where: { id: active.id },
      data: {
        checkOutAt,
        durationMinutes,
        notes: notes || active.notes,
      },
    })

    await logAudit({
      userId: session.id,
      branchId: session.branchId,
      actorBranchId: session.branchId,
      action: 'ATTENDANCE_CHECK_OUT',
      entity: 'Attendance',
      entityId: active.id,
      newValue: { durationMinutes },
    })

    return NextResponse.json({ success: true, attendance: updated })
  } catch (err) {
    console.error('[check-out]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
