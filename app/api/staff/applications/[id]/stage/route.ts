import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'
import { createApprovalSteps } from '@/lib/approvalWorkflow'

const VALID_STAGES = [
  'SUBMITTED',
  'INITIAL_REVIEW',
  'DOCS_REVIEW',
  'SURVEY',
  'PRICING',
  'COMMITTEE',
  'CONTRACT',
  'COMPLETED',
  'REJECTED',
] as const

const schema = z
  .object({
    toStage: z.enum(VALID_STAGES),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (d) =>
      d.toStage !== 'REJECTED' ||
      (typeof d.notes === 'string' && d.notes.trim().length >= 5),
    { message: 'سبب الرفض إجباري (5 أحرف على الأقل)', path: ['notes'] }
  )

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!can(session, 'applications.transfer')) {
    return NextResponse.json({ error: 'لا تملك صلاحية نقل المراحل' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, stage: true, status: true, branchId: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // التحقق من الفرع
    if (
      session.roleKey !== 'admin' &&
      application.branchId &&
      application.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
    }

    if (application.stage === data.toStage) {
      return NextResponse.json(
        { error: 'الطلب بالفعل في هذه المرحلة' },
        { status: 400 }
      )
    }

    if (application.status === 'COMPLETED' || application.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'الطلب مغلق ولا يمكن تعديل مرحلته' },
        { status: 400 }
      )
    }

    // تحديد الحالة الجديدة
    const isReject = data.toStage === 'REJECTED'
    let newStatus = application.status
    let completedAt: Date | null = null

    if (data.toStage === 'COMPLETED') {
      newStatus = 'COMPLETED'
      completedAt = new Date()
    } else if (isReject) {
      newStatus = 'ON_HOLD'
    } else if (application.status === 'ON_HOLD') {
      newStatus = 'ACTIVE'
    }

    const result = await prisma.$transaction(async (tx) => {
      // تحديث الطلب
      const updateData: Record<string, unknown> = {
        stage: isReject ? application.stage : data.toStage,
        status: newStatus,
        completedAt: isReject ? null : completedAt,
      }
      if (isReject) {
        updateData.rejectionReason = data.notes
        updateData.rejectedAt = new Date()
        updateData.rejectedById = session.id
      }

      const updated = await tx.application.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          stage: true,
          status: true,
          updatedAt: true,
        },
      })

      // تسجيل في التاريخ
      await tx.stageHistory.create({
        data: {
          applicationId: id,
          fromStage: application.stage,
          toStage: isReject ? 'REJECTED' : data.toStage,
          action: isReject ? 'REJECT' : 'TRANSFER',
          notes: data.notes || null,
          userId: session.id,
        },
      })

      // إشعار للمواطن
      const app = await tx.application.findUnique({
        where: { id },
        select: { citizenId: true, trackingNumber: true },
      })

      if (app) {
        await tx.notification.create({
          data: {
            citizenId: app.citizenId,
            applicationId: id,
            title: isReject ? 'تم إيقاف طلبك' : 'تم تحديث حالة طلبك',
            body: isReject
              ? `الطلب ${app.trackingNumber} تم إيقافه. السبب: ${data.notes}`
              : `الطلب ${app.trackingNumber} انتقل إلى مرحلة: ${data.toStage}`,
          },
        })
      }

      return updated
    })

    if (data.toStage === 'CONTRACT') {
      await createApprovalSteps(id, data.toStage)
    }

    await logAudit({
      userId: session.id,
      branchId: application.branchId,
      actorBranchId: session.branchId,
      action: isReject ? 'APPLICATION_REJECT' : 'APPLICATION_STAGE_CHANGE',
      entity: 'Application',
      entityId: id,
      oldValue: { stage: application.stage, status: application.status },
      newValue: isReject
        ? { status: newStatus, rejectionReason: data.notes }
        : { stage: data.toStage, status: newStatus },
    })

    return NextResponse.json({ success: true, application: result })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[stage-change]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
