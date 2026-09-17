import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const updateSchema = z.object({
  type: z.enum(['inspection', 'survey', 'pricing', 'other']).optional(),
  amount: z.number().positive().optional(),
  receiptNumber: z.string().nullable().optional(),
  receiptImageUrl: z.string().url().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

// PATCH: تعديل دفعة
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'payments.edit')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id, paymentId } = await params

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existing = await prisma.payment.findFirst({
      where: { id: paymentId, applicationId: id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'الدفعة غير موجودة' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.type !== undefined) updateData.type = data.type
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.receiptNumber !== undefined) updateData.receiptNumber = data.receiptNumber
    if (data.receiptImageUrl !== undefined) updateData.receiptImageUrl = data.receiptImageUrl
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.paidAt !== undefined) {
      updateData.paidAt = data.paidAt ? new Date(data.paidAt) : null
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    })

    await logAudit({
      userId: session.id,
      action: 'PAYMENT_UPDATE',
      entity: 'Payment',
      entityId: paymentId,
      oldValue: { amount: existing.amount, type: existing.type },
      newValue: { amount: payment.amount, type: payment.type },
    })

    return NextResponse.json({ success: true, payment })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[payment-update]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}

// DELETE: حذف دفعة
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'payments.delete')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id, paymentId } = await params

  const existing = await prisma.payment.findFirst({
    where: { id: paymentId, applicationId: id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'الدفعة غير موجودة' }, { status: 404 })
  }

  await prisma.payment.delete({ where: { id: paymentId } })

  await logAudit({
    userId: session.id,
    action: 'PAYMENT_DELETE',
    entity: 'Payment',
    entityId: paymentId,
    oldValue: { amount: existing.amount, type: existing.type },
  })

  return NextResponse.json({ success: true })
}
