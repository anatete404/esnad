import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'contracts.sign') && !can(session, 'contracts.create')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      application: {
        select: { id: true, branchId: true, status: true, stage: true },
      },
    },
  })

  if (!contract) {
    return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 })
  }

  if (
    session.roleKey !== 'admin' &&
    contract.application.branchId &&
    contract.application.branchId !== session.branchId
  ) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  if (contract.signedAt) {
    return NextResponse.json({ error: 'العقد موقّع بالفعل' }, { status: 400 })
  }

  const now = new Date()

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.contract.update({
      where: { id },
      data: { signedAt: now },
    })

    if (contract.application.status !== 'COMPLETED') {
      await tx.application.update({
        where: { id: contract.application.id },
        data: {
          stage: 'COMPLETED',
          status: 'COMPLETED',
          completedAt: now,
        },
      })

      await tx.stageHistory.create({
        data: {
          applicationId: contract.application.id,
          fromStage: contract.application.stage,
          toStage: 'COMPLETED',
          action: 'CONTRACT_SIGNED',
          notes: `تم توقيع العقد ${contract.contractNo}`,
          userId: session.id,
        },
      })

      const app = await tx.application.findUnique({
        where: { id: contract.application.id },
        select: { id: true, citizenId: true, trackingNumber: true },
      })
      if (app) {
        await tx.notification.create({
          data: {
            citizenId: app.citizenId,
            applicationId: app.id,
            title: 'تم توقيع العقد بنجاح',
            body: `رقم العقد: ${contract.contractNo}`,
          },
        })
      }
    }

    return updated
  })

  await logAudit({
    userId: session.id,
    action: 'CONTRACT_SIGN',
    entity: 'Contract',
    entityId: id,
    oldValue: { signedAt: null },
    newValue: { signedAt: now.toISOString() },
  })

  return NextResponse.json({ success: true, contract: result })
}
