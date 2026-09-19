import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'appeals.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const branchScope = scopeWhere(session, 'BRANCH')
  const where: Record<string, unknown> = {}
  if (Object.keys(branchScope).length > 0) {
    where.application = { branchId: (branchScope as { branchId: string }).branchId }
  }

  const [total, pending, approved, rejected] = await Promise.all([
    prisma.appeal.count({ where }),
    prisma.appeal.count({ where: { ...where, status: 'PENDING' } }),
    prisma.appeal.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.appeal.count({ where: { ...where, status: 'REJECTED' } }),
  ])

  return NextResponse.json({ total, pending, approved, rejected })
}
