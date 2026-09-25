import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession, hashPassword } from '@/lib/auth'
import { can, ROLES } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

async function generateEmployeeNumber(tx: Prisma.TransactionClient): Promise<string> {
  const sequence = await tx.employeeNumberSequence.findUnique({ where: { id: 1 } })
  if (!sequence) throw new Error('EmployeeNumberSequence not initialized')

  const employeeNumber = `ESNAD-EMP-${String(sequence.nextValue).padStart(4, '0')}`
  await tx.employeeNumberSequence.update({
    where: { id: 1 },
    data: { nextValue: sequence.nextValue + 1 },
  })
  return employeeNumber
}

function isEmployeeNumberRetryable(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false
  if (error.code === 'P2034') return true
  return error.code === 'P2002' && JSON.stringify(error.meta?.target).includes('employeeNumber')
}

export async function GET() {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const canManageAll = can(session, 'users.manage')
  const canManageBranch = can(session, 'users.manage.branch')
  if (!canManageAll && !canManageBranch) return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  if (canManageBranch && !canManageAll && !session.branchId) return NextResponse.json({ error: 'لا يوجد فرع مرتبط بحسابك' }, { status: 400 })
  const users = await prisma.user.findMany({
    where: canManageAll ? undefined : { branchId: session.branchId },
    select: { id: true, email: true, fullName: true, phone: true, nationalId: true, employeeNumber: true, isActive: true, terminatedAt: true, terminationReason: true, lastLoginAt: true, createdAt: true, role: { select: { key: true, nameAr: true } }, branch: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ users })
}

const createSchema = z.object({ email: z.string().email('البريد غير صحيح'), password: z.string().min(8, 'كلمة السر 8 أحرف على الأقل'), fullName: z.string().min(3, 'الاسم قصير جداً'), phone: z.string().optional(), nationalId: z.string().regex(/^\d{14}$/, 'الرقم القومي 14 رقم').optional().or(z.literal('')), roleKey: z.string(), branchId: z.string().nullable().optional() })

export async function POST(req: Request) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const canManageAll = can(session, 'users.manage')
  const canManageBranch = can(session, 'users.manage.branch')
  if (!canManageAll && !canManageBranch) return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  try {
    const data = createSchema.parse(await req.json())
    if (!(data.roleKey in ROLES)) return NextResponse.json({ error: 'الدور غير صحيح' }, { status: 400 })
    if (!canManageAll && ['admin', 'branch_manager'].includes(data.roleKey)) return NextResponse.json({ error: 'لا يمكنك إنشاء هذا الدور' }, { status: 403 })
    const branchId = canManageAll ? data.branchId || null : session.branchId
    if (!canManageAll && !branchId) return NextResponse.json({ error: 'لا يوجد فرع مرتبط بحسابك' }, { status: 400 })
    if (data.branchId && !canManageAll && data.branchId !== session.branchId) return NextResponse.json({ error: 'لا يمكنك إنشاء موظف في فرع آخر' }, { status: 403 })
    if (await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })) return NextResponse.json({ error: 'البريد مستخدم بالفعل' }, { status: 400 })
    const nationalId = data.nationalId?.trim() || null
    if (nationalId && await prisma.user.findUnique({ where: { nationalId } })) return NextResponse.json({ error: 'الرقم القومي مستخدم بالفعل' }, { status: 400 })
    const role = await prisma.role.findUnique({ where: { key: data.roleKey } })
    if (!role) return NextResponse.json({ error: 'الدور غير موجود' }, { status: 400 })
    if (branchId && !(await prisma.branch.findUnique({ where: { id: branchId } }))) return NextResponse.json({ error: 'الفرع غير موجود' }, { status: 400 })
    const userData = { email: data.email.toLowerCase(), passwordHash: await hashPassword(data.password), fullName: data.fullName, phone: data.phone || null, nationalId, roleId: role.id, branchId }
    const createUser = async () => prisma.$transaction(async (tx) => {
      const employeeNumber = await generateEmployeeNumber(tx)
      return tx.user.create({ data: { ...userData, employeeNumber }, select: { id: true, email: true, fullName: true, phone: true, nationalId: true, employeeNumber: true, isActive: true, terminatedAt: true, terminationReason: true, role: { select: { key: true, nameAr: true } }, branch: { select: { id: true, name: true } } } })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    let user: Awaited<ReturnType<typeof createUser>> | undefined
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        user = await createUser()
        break
      } catch (error) {
        if (!isEmployeeNumberRetryable(error) || attempt === 2) throw error
      }
    }
    if (!user) throw new Error('User creation failed')
    await logAudit({ userId: session.id, branchId: user.branch?.id ?? null, actorBranchId: session.branchId, action: 'USER_CREATE', entity: 'User', entityId: user.id, newValue: { email: user.email, fullName: user.fullName, roleKey: data.roleKey, branchId: user.branch?.id, nationalId: user.nationalId, employeeNumber: user.employeeNumber } })
    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0]?.message || 'بيانات غير صحيحة' }, { status: 400 })
    console.error('[user-create]', err); return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
