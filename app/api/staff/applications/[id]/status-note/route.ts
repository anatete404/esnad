import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  statusNote: z.string().max(500).nullable(),
  manual: z.boolean().default(true),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'applications.edit')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, branchId: true, statusNote: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (
      session.roleKey !== 'admin' &&
      application.branchId &&
      application.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        statusNote: data.statusNote,
        statusNoteManual: data.manual,
        statusNoteUpdatedAt: new Date(),
      },
      select: {
        id: true,
        statusNote: true,
        statusNoteManual: true,
        statusNoteUpdatedAt: true,
      },
    })

    await logAudit({
      userId: session.id,
      action: 'APPLICATION_STATUS_NOTE_UPDATE',
      entity: 'Application',
      entityId: id,
      oldValue: { statusNote: application.statusNote },
      newValue: { statusNote: data.statusNote, manual: data.manual },
    })

    return NextResponse.json({ success: true, application: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[status-note]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
