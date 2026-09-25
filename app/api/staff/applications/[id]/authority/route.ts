import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  authorityName: z.string().max(200).nullable(),
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
      select: { id: true, branchId: true, land: { select: { authorityName: true } } },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (!application.land) {
      return NextResponse.json({ error: 'لا توجد بيانات أرض' }, { status: 404 })
    }

    if (
      session.roleKey !== 'admin' &&
      application.branchId &&
      application.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
    }

    const updated = await prisma.land.update({
      where: { applicationId: id },
      data: { authorityName: data.authorityName },
      select: { id: true, authorityName: true },
    })

    await logAudit({
      userId: session.id,
      branchId: application.branchId,
      actorBranchId: session.branchId,
      action: 'LAND_AUTHORITY_UPDATE',
      entity: 'Land',
      entityId: updated.id,
      oldValue: { authorityName: application.land.authorityName },
      newValue: { authorityName: data.authorityName },
    })

    return NextResponse.json({ success: true, land: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[authority-update]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
