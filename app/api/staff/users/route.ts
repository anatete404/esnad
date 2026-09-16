import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession, hashPassword } from '@/lib/auth'
import { can, ROLES } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

export async function GET() {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  if (!can(session, 'users.manage') && !can(session, 'applications.view')) return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  const users = await prisma.user.findMany({ select: { id: true, email: true, fullName: true, phone: true, isActive: true, lastLoginAt: true, createdAt: true, role: { select: { key: true, nameAr: true } }, branch: { select: { id: true, name: true } } }, orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ users })
}

const createSchema = z.object({ email: z.string().email('البريد غير صحيح'), password: z.string().min(8, 'كلمة السر 8 أحرف على الأقل'), fullName: z.string().min(3, 'الاسم قصير جداً'), phone: z.string().optional(), roleKey: z.string(), branchId: z.string().nullable().optional() })

export async function POST(req: Request) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  if (!can(session, 'users.manage')) return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  try {
    const data = createSchema.parse(await req.json())
    if (!(data.roleKey in ROLES)) return NextResponse.json({ error: 'الدور غير صحيح' }, { status: 400 })
    if (await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })) return NextResponse.json({ error: 'البريد مستخدم بالفعل' }, { status: 400 })
    const role = await prisma.role.findUnique({ where: { key: data.roleKey } })
    if (!role) return NextResponse.json({ error: 'الدور غير موجود' }, { status: 400 })
    if (data.branchId && !(await prisma.branch.findUnique({ where: { id: data.branchId } }))) return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 400 })
    const user = await prisma.user.create({ data: { email: data.email.toLowerCase(), passwordHash: await hashPassword(data.password), fullName: data.fullName, phone: data.phone || null, roleId: role.id, branchId: data.branchId || null }, select: { id: true, email: true, fullName: true, role: { select: { key: true, nameAr: true } }, branch: { select: { id: true, name: true } } } })
    await logAudit({ userId: session.id, action: 'USER_CREATE', entity: 'User', entityId: user.id, newValue: { email: user.email, roleKey: data.roleKey } })
    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message || 'بيانات غير صحيحة' }, { status: 400 })
    console.error('[user-create]', err); return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
