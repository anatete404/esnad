import 'server-only'
import { prisma } from './prisma'

export const STAGE_APPROVALS: Record<
  string,
  Array<{ level: number; roleRequired: string; title: string }>
> = {
  CONTRACT: [
    { level: 1, roleRequired: 'reviewer', title: 'مراجعة نهائية للبيانات' },
    { level: 2, roleRequired: 'legal', title: 'المراجعة القانونية للعقد' },
    { level: 3, roleRequired: 'branch_manager', title: 'اعتماد مدير الفرع' },
  ],
  COMPLETED: [
    { level: 1, roleRequired: 'branch_manager', title: 'اعتماد إتمام التعاقد' },
  ],
}

export function getApprovalsForStage(stage: string) {
  return STAGE_APPROVALS[stage] || []
}

export async function createApprovalSteps(applicationId: string, stage: string) {
  const steps = getApprovalsForStage(stage)
  if (steps.length === 0) return []

  const existing = await prisma.approvalStep.findMany({
    where: { applicationId },
  })
  if (existing.length > 0) return existing

  return Promise.all(
    steps.map((step) =>
      prisma.approvalStep.create({
        data: {
          applicationId,
          level: step.level,
          roleRequired: step.roleRequired,
          title: step.title,
          status: 'PENDING',
        },
      }),
    ),
  )
}

export async function areAllApprovalsDone(applicationId: string): Promise<boolean> {
  const steps = await prisma.approvalStep.findMany({
    where: { applicationId },
  })
  if (steps.length === 0) return true
  return steps.every((step) => step.status === 'APPROVED')
}
