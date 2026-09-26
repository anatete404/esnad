import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, ROLES } from '@/lib/rbac'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const canManageAll = can(session, 'users.manage')
  const canManageBranch = can(session, 'users.manage.branch')
  if (!canManageAll && !canManageBranch) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const [rolesFromDb, branches] = await Promise.all([
    prisma.role.findMany({
      select: { id: true, key: true, nameAr: true, permissions: true },
    }),
    canManageAll
      ? prisma.branch.findMany({
          select: { id: true, name: true, city: true },
          orderBy: { name: 'asc' },
        })
      : session.branchId
        ? prisma.branch.findMany({
            where: { id: session.branchId },
            select: { id: true, name: true, city: true },
          })
        : Promise.resolve([] as Array<{ id: string; name: string; city: string | null }>),
  ])

  const roles = rolesFromDb.map((r) => ({
    id: r.id,
    key: r.key,
    nameAr: r.nameAr,
    permissionsCount: (() => {
      try { return JSON.parse(r.permissions).length } catch { return 0 }
    })(),
    isSystem: r.key in ROLES,
  }))

  return NextResponse.json({ roles, branches })
}
