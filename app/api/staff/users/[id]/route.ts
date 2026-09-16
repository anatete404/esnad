import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession, hashPassword } from '@/lib/auth'
import { can, ROLES } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession(); if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 }); if (!can(session, 'users.manage')) return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  const user = await prisma.user.findUnique({ where: { id: (await params).id }, select: { id: true, email: true, fullName: true, phone: true, isActive: true, lastLoginAt: true, createdAt: true, role: { select: { key: true, nameAr: true } }, branch: { select: { id: true, name: true } } } })
  return user ? NextResponse.json({ user }) : NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 })
}
const schema = z.object({ fullName: z.string().min(3).optional(), phone: z.string().optional(), roleKey: z.string().optional(), branchId: z.string().nullable().optional(), isActive: z.boolean().optional(), password: z.string().min(8).optional() })
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession(); if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 }); if (!can(session, 'users.manage')) return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  const id = (await params).id; const data = schema.parse(await req.json()); if (id === session.id && data.isActive === false) return NextResponse.json({ error: 'لا يمكنك تعطيل حسابك الشخصي' }, { status: 400 })
  const updateData: Record<string, unknown> = { ...data }; delete updateData.roleKey; delete updateData.password; if (data.password) updateData.passwordHash = await hashPassword(data.password); if (data.roleKey) { if (!(data.roleKey in ROLES)) return NextResponse.json({ error: 'الدور غير صحيح' }, { status: 400 }); const role = await prisma.role.findUnique({ where: { key: data.roleKey } }); if (!role) return NextResponse.json({ error: 'الدور غير موجود' }, { status: 400 }); updateData.roleId = role.id } if (data.phone !== undefined) updateData.phone = data.phone || null; const user = await prisma.user.update({ where: { id }, data: updateData, select: { id: true, email: true, fullName: true, isActive: true, role: { select: { key: true, nameAr: true } }, branch: { select: { id: true, name: true } } } }); await logAudit({ userId: session.id, action: 'USER_UPDATE', entity: 'User', entityId: id, newValue: data }); return NextResponse.json({ success: true, user })
}
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) { const session = await getUserSession(); if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 }); if (!can(session, 'users.manage')) return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 }); const id = (await params).id; if (id === session.id) return NextResponse.json({ error: 'لا يمكنك حذف حسابك الشخصي' }, { status: 400 }); const user = await prisma.user.findUnique({ where: { id }, include: { _count: { select: { assignedApps: true } } } }); if (!user) return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 }); if (user._count.assignedApps > 0) return NextResponse.json({ error: `لا يمكن حذف الموظف - لديه ${user._count.assignedApps} طلب مسند إليه` }, { status: 400 }); await prisma.user.delete({ where: { id } }); await logAudit({ userId: session.id, action: 'USER_DELETE', entity: 'User', entityId: id }); return NextResponse.json({ success: true }) }
