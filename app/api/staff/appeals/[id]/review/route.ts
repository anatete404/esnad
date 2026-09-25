import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().max(1000).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = schema.parse(body)

    if (data.decision === 'APPROVED' && !can(session, 'appeals.approve')) {
      return NextResponse.json({ error: 'لا تملك صلاحية قبول التظلمات' }, { status: 403 })
    }
    if (data.decision === 'REJECTED' && !can(session, 'appeals.reject')) {
      return NextResponse.json({ error: 'لا تملك صلاحية رفض التظلمات' }, { status: 403 })
    }

    const appeal = await prisma.appeal.findUnique({
      where: { id },
      include: {
        application: {
          select: { id: true, branchId: true, status: true, stage: true, trackingNumber: true, citizenId: true },
        },
      },
    })

    if (!appeal) {
      return NextResponse.json({ error: 'التظلم غير موجود' }, { status: 404 })
    }

    if (
      session.roleKey !== 'admin' &&
      appeal.application.branchId &&
      appeal.application.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
    }

    if (appeal.status !== 'PENDING') {
      return NextResponse.json({ error: 'تمت مراجعة التظلم بالفعل' }, { status: 400 })
    }

    const now = new Date()

    const result = await prisma.$transaction(async (tx) => {
      const updatedAppeal = await tx.appeal.update({
        where: { id },
        data: {
          status: data.decision,
          decisionNotes: data.notes || null,
          reviewedById: session.id,
          reviewedAt: now,
        },
      })

      if (data.decision === 'APPROVED') {
        await tx.application.update({
          where: { id: appeal.application.id },
          data: {
            status: 'ACTIVE',
            stage: 'INITIAL_REVIEW',
            completedAt: null,
          },
        })

        await tx.stageHistory.create({
          data: {
            applicationId: appeal.application.id,
            fromStage: appeal.application.stage,
            toStage: 'INITIAL_REVIEW',
            action: 'APPEAL_APPROVED',
            notes: `تم قبول التظلم — ${data.notes || 'بدون ملاحظات'}`,
            userId: session.id,
          },
        })

        await tx.notification.create({
          data: {
            citizenId: appeal.application.citizenId,
            applicationId: appeal.application.id,
            title: 'تم قبول تظلمك',
            body: `تم إعادة فتح طلبك ${appeal.application.trackingNumber} للمراجعة`,
          },
        })
      } else {
        await tx.stageHistory.create({
          data: {
            applicationId: appeal.application.id,
            fromStage: appeal.application.stage,
            toStage: 'REJECTED',
            action: 'APPEAL_REJECTED',
            notes: `تم رفض التظلم — ${data.notes || 'بدون ملاحظات'}`,
            userId: session.id,
          },
        })

        await tx.notification.create({
          data: {
            citizenId: appeal.application.citizenId,
            applicationId: appeal.application.id,
            title: 'تم رفض تظلمك',
            body: `تم رفض تظلمك على الطلب ${appeal.application.trackingNumber}`,
          },
        })
      }

      return updatedAppeal
    })

    await logAudit({
      userId: session.id,
      branchId: appeal.application.branchId,
      actorBranchId: session.branchId,
      action: data.decision === 'APPROVED' ? 'APPEAL_APPROVE' : 'APPEAL_REJECT',
      entity: 'Appeal',
      entityId: id,
      oldValue: { status: 'PENDING' },
      newValue: { status: data.decision, notes: data.notes },
    })

    return NextResponse.json({ success: true, appeal: result })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[appeal-review]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
