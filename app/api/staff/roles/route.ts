import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, ROLES } from '@/lib/rbac'

export async function GET() {
  const session = await getUserSession(); if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 }); if (!can(session, 'users.manage')) return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  const [rolesFromDb, branches] = await Promise.all([prisma.role.findMany({ select: { id: true, key: true, nameAr: true, permissions: true } }), prisma.branch.findMany({ select: { id: true, name: true, city: true }, orderBy: { name: 'asc' } })])
  const roles = rolesFromDb.map((r) => ({ id: r.id, key: r.key, nameAr: r.nameAr, permissionsCount: (() => { try { return JSON.parse(r.permissions).length } catch { return 0 } })(), isSystem: r.key in ROLES }))
  return NextResponse.json({ roles, branches })
}
