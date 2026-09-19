import { NextResponse } from 'next/server'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  value: z.number().positive('القيمة يجب أن تكون أكبر من صفر'),
  paymentPlan: z.string().max(500).optional(),
})

function generateContractNo(): string {
  const year = new Date().getFullYear()
  const code = nanoid(6).toUpperCase().replace(/[-_]/g, 'X')
  return `CNT-${year}-${code}`
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'contracts.create')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id },
      include: { contract: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (
      session.roleKey !== 'admin' &&
      application.branchId &&
      application.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
    }

    if (application.contract) {
      return NextResponse.json({ error: 'يوجد عقد بالفعل لهذا الطلب' }, { status: 400 })
    }

    if (application.status === 'REJECTED') {
      return NextResponse.json({ error: 'لا يمكن إنشاء عقد لطلب مرفوض' }, { status: 400 })
    }

    let contractNo = generateContractNo()
    let attempts = 0
    while (attempts < 5) {
      const exists = await prisma.contract.findUnique({ where: { contractNo } })
      if (!exists) break
      contractNo = generateContractNo()
      attempts++
    }

    const contract = await prisma.contract.create({
      data: {
        applicationId: id,
        contractNo,
        value: data.value,
        paymentPlan: data.paymentPlan || null,
      },
    })

    await logAudit({
      userId: session.id,
      action: 'CONTRACT_CREATE',
      entity: 'Contract',
      entityId: contract.id,
      newValue: { applicationId: id, contractNo, value: data.value },
    })

    return NextResponse.json({ success: true, contract }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[contract-create]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
