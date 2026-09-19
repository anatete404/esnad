import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(100, Math.max(20, parseInt(searchParams.get('limit') || '50')))

  const logs = await prisma.auditLog.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      action: true,
      entity: true,
      entityId: true,
      createdAt: true,
    },
  })

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - 7)

  const [
    totalActions,
    weekActions,
    stageChanges,
    docsVerified,
  ] = await Promise.all([
    prisma.auditLog.count({ where: { userId: session.id } }),
    prisma.auditLog.count({
      where: { userId: session.id, createdAt: { gte: startOfWeek } },
    }),
    prisma.auditLog.count({
      where: {
        userId: session.id,
        action: { in: ['APPLICATION_STAGE_CHANGE', 'APPLICATION_ASSIGN'] },
      },
    }),
    prisma.document.count({ where: { verifiedById: session.id } }),
  ])

  return NextResponse.json({
    logs,
    stats: {
      totalActions,
      weekActions,
      stageChanges,
      docsVerified,
    },
  })
}
