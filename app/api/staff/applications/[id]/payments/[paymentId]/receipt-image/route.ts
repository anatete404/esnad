import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const MAX_SIZE = 4 * 1024 * 1024 // 4 MB

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

function isValidMime(mime: string): boolean {
  return (ALLOWED_TYPES as readonly string[]).includes(mime)
}

export async function POST(
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

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, applicationId: id },
    select: {
      id: true,
      receiptImageUrl: true,
      application: { select: { branchId: true } },
    },
  })

  if (!payment) {
    return NextResponse.json({ error: 'الدفعة غير موجودة' }, { status: 404 })
  }

  if (
    session.roleKey !== 'admin' &&
    payment.application.branchId &&
    payment.application.branchId !== session.branchId
  ) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `حجم الملف يتجاوز ${MAX_SIZE / 1024 / 1024} ميجا` },
        { status: 400 }
      )
    }

    if (!isValidMime(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم (JPG, PNG, WEBP, PDF فقط)' },
        { status: 400 }
      )
    }

    // احذف الصورة القديمة إن وجدت
    if (payment.receiptImageUrl) {
      try {
        await del(payment.receiptImageUrl, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        })
      } catch (err) {
        console.error('[receipt-image] old delete failed:', err)
      }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const fileName = `${nanoid(20)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const blob = await put(`receipts/${paymentId}/${fileName}`, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    })

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { receiptImageUrl: blob.url },
      select: { id: true, receiptImageUrl: true },
    })

    await logAudit({
      userId: session.id,
      action: 'PAYMENT_RECEIPT_IMAGE_UPLOAD',
      entity: 'Payment',
      entityId: paymentId,
      oldValue: { receiptImageUrl: payment.receiptImageUrl },
      newValue: { receiptImageUrl: blob.url },
    })

    return NextResponse.json({ success: true, payment: updated }, { status: 201 })
  } catch (err) {
    console.error('[receipt-image-upload]', err)
    return NextResponse.json({ error: 'خطأ في رفع الصورة' }, { status: 500 })
  }
}
