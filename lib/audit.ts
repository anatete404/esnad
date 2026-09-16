import 'server-only'
import { prisma } from './prisma'

export async function logAudit(params: {
  userId?: string | null
  action: string
  entity: string
  entityId?: string
  oldValue?: unknown
  newValue?: unknown
  ip?: string
  userAgent?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
        newValue: params.newValue ? JSON.stringify(params.newValue) : null,
        ip: params.ip,
        userAgent: params.userAgent,
      },
    })
  } catch (err) {
    console.error('[audit] failed:', err)
  }
}
