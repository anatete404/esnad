import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  action: z.enum(['assign', 'stage']),
  assignedToId: z.string().nullable().optional(),
  toStage: z.string().optional(),
  notes: z.string().max(500).optional(),
})

const VALID_STAGES = [
  'SUBMITTED','INITIAL_REVIEW','DOCS_REVIEW','SURVEY',
  'PRICING','COMMITTEE','CONTRACT','COMPLETED','REJECTED',
]

export async function POST(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const data = schema.parse(await req.json())

    if (data.action === 'assign' && !can(session, 'applications.assign')) {
      return NextResponse.json({ error: 'لا تملك صلاحية الإسناد' }, { status: 403 })
    }
    if (data.action === 'stage' && !can(session, 'applications.transfer')) {
      return NextResponse.json({ error: 'لا تملك صلاحية النقل' }, { status: 403 })
    }

    if (data.action === 'stage') {
      if (!data.toStage || !VALID_STAGES.includes(data.toStage)) {
        return NextResponse.json({ error: 'المرحلة غير صحيحة' }, { status: 400 })
      }
    }

    const scope = scopeWhere(session, 'BRANCH')
    const apps = await prisma.application.findMany({
      where: { id: { in: data.ids }, ...scope },
      select: { id: true, stage: true, status: true, assignedToId: true },
    })

    if (apps.length === 0) {
      return NextResponse.json({ error: 'لم يتم العثور على طلبات' }, { status: 404 })
    }

    const validIds = apps.map((a) => a.id)
    let updated = 0

    if (data.action === 'assign') {
      if (data.assignedToId) {
        const target = await prisma.user.findUnique({
          where: { id: data.assignedToId },
          select: { id: true, isActive: true },
        })
        if (!target || !target.isActive) {
          return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 400 })
        }
      }

      const result = await prisma.application.updateMany({
        where: { id: { in: validIds } },
        data: { assignedToId: data.assignedToId || null },
      })
      updated = result.count

      for (const id of validIds) {
        await prisma.stageHistory.create({
          data: {
            applicationId: id,
            fromStage: null,
            toStage: 'ASSIGN',
            action: 'BULK_ASSIGN',
            notes: data.notes || null,
            userId: session.id,
          },
        })
      }

      await logAudit({
        userId: session.id,
        branchId: Object.keys(scope).length > 0
          ? (scope as { branchId: string }).branchId
          : null,
        actorBranchId: session.branchId,
        action: 'BULK_ASSIGN',
        entity: 'Application',
        newValue: { count: updated, assignedToId: data.assignedToId, ids: validIds },
      })
    }

    if (data.action === 'stage') {
      for (const app of apps) {
        if (app.stage === data.toStage) continue
        if (app.status === 'COMPLETED' || app.status === 'REJECTED') continue

        let newStatus = app.status
        let completedAt: Date | null = null
        if (data.toStage === 'COMPLETED') {
          newStatus = 'COMPLETED'
          completedAt = new Date()
        } else if (data.toStage === 'REJECTED') {
          newStatus = 'REJECTED'
          completedAt = new Date()
        } else if (app.status === 'ON_HOLD') {
          newStatus = 'ACTIVE'
        }

        await prisma.application.update({
          where: { id: app.id },
          data: { stage: data.toStage, status: newStatus, completedAt },
        })

        await prisma.stageHistory.create({
          data: {
            applicationId: app.id,
            fromStage: app.stage,
            toStage: data.toStage!,
            action: 'BULK_TRANSFER',
            notes: data.notes || null,
            userId: session.id,
          },
        })

        updated++
      }

      await logAudit({
        userId: session.id,
        branchId: Object.keys(scope).length > 0
          ? (scope as { branchId: string }).branchId
          : null,
        actorBranchId: session.branchId,
        action: 'BULK_STAGE_CHANGE',
        entity: 'Application',
        newValue: { count: updated, toStage: data.toStage, ids: validIds },
      })
    }

    return NextResponse.json({ success: true, updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message || 'بيانات غير صحيحة' }, { status: 400 })
    }
    console.error('[bulk-action]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
