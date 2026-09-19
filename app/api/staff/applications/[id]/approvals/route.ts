import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'applications.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  const steps = await prisma.approvalStep.findMany({
    where: { applicationId: id },
    include: {
      approvedBy: { select: { id: true, fullName: true } },
    },
    orderBy: { level: 'asc' },
  })

  return NextResponse.json({ steps })
}

const schema = z.object({
  stepId: z.string(),
  decision: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().max(500).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params

  try {
    const data = schema.parse(await req.json())
    const step = await prisma.approvalStep.findFirst({
      where: { id: data.stepId, applicationId: id },
    })

    if (!step) {
      return NextResponse.json({ error: 'الموافقة غير موجودة' }, { status: 404 })
    }

    if (step.status !== 'PENDING') {
      return NextResponse.json({ error: 'تمت مراجعة هذه الخطوة بالفعل' }, { status: 400 })
    }

    if (session.roleKey !== 'admin' && session.roleKey !== step.roleRequired) {
      return NextResponse.json({ error: 'لا تملك صلاحية هذه الخطوة' }, { status: 403 })
    }

    if (step.level > 1) {
      const previousStep = await prisma.approvalStep.findFirst({
        where: { applicationId: id, level: step.level - 1 },
      })
      if (previousStep && previousStep.status !== 'APPROVED') {
        return NextResponse.json(
          { error: 'يجب اعتماد المرحلة السابقة أولاً' },
          { status: 400 },
        )
      }
    }

    const updated = await prisma.approvalStep.update({
      where: { id: data.stepId },
      data: {
        status: data.decision,
        approvedById: session.id,
        approvedAt: new Date(),
        notes: data.notes || null,
      },
    })

    await logAudit({
      userId: session.id,
      action: data.decision === 'APPROVED' ? 'APPROVAL_APPROVE' : 'APPROVAL_REJECT',
      entity: 'ApprovalStep',
      entityId: data.stepId,
      newValue: { applicationId: id, level: step.level, decision: data.decision },
    })

    return NextResponse.json({ success: true, step: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 },
      )
    }
    console.error('[approval]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
