import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const createSchema = z.object({
  type: z.enum(['inspection', 'survey', 'pricing', 'other']),
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  receiptNumber: z.string().nullable().optional(),
  receiptImageUrl: z.string().url().optional(),
  paidAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

// GET: قائمة دفعات الطلب
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'payments.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  const application = await prisma.application.findUnique({
    where: { id },
    select: { id: true, branchId: true },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  if (
    session.roleKey !== 'admin' &&
    session.roleKey !== 'authority_viewer' &&
    application.branchId &&
    application.branchId !== session.branchId
  ) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const payments = await prisma.payment.findMany({
    where: { applicationId: id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ payments })
}

// POST: إضافة دفعة جديدة
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'payments.create')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, branchId: true, status: true },
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

    if (application.status === 'REJECTED') {
      return NextResponse.json({ error: 'لا يمكن إضافة دفعات لطلب مرفوض' }, { status: 400 })
    }

    const payment = await prisma.payment.create({
      data: {
        applicationId: id,
        type: data.type,
        amount: data.amount,
        receiptNumber: data.receiptNumber || null,
        receiptImageUrl: data.receiptImageUrl || null,
        paidAt: data.paidAt ? new Date(data.paidAt) : null,
        notes: data.notes || null,
        createdById: session.id,
      },
    })

    await logAudit({
      userId: session.id,
      action: 'PAYMENT_CREATE',
      entity: 'Payment',
      entityId: payment.id,
      newValue: { applicationId: id, type: data.type, amount: data.amount },
    })

    return NextResponse.json({ success: true, payment }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[payment-create]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
