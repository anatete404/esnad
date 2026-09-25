import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const PAYMENT_LABELS: Record<string, string> = {
  inspection: 'رسوم الفحص',
  survey: 'رسوم المعاينة',
  pricing: 'رسوم التسعير',
  other: 'أخرى',
}

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(',')
}

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'payments.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const branchScope = scopeWhere(session, 'BRANCH')
  const where: Record<string, unknown> = {}
  if (Object.keys(branchScope).length > 0) {
    where.application = { branchId: (branchScope as { branchId: string }).branchId }
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      application: {
        select: {
          trackingNumber: true,
          citizen: { select: { fullName: true, nationalId: true, phone: true } },
          land: { select: { gov: true, center: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  })

  let totalAmount = 0
  const rows = [
    csvRow([
      'رقم التتبع', 'اسم المواطن', 'الرقم القومي', 'الهاتف', 'المحافظة',
      'نوع الرسوم', 'المبلغ', 'رقم الإيصال', 'تاريخ الدفع', 'تاريخ التسجيل', 'ملاحظات',
    ]),
    ...payments.map((payment) => {
      totalAmount += payment.amount
      return csvRow([
        payment.application.trackingNumber,
        payment.application.citizen.fullName,
        payment.application.citizen.nationalId,
        payment.application.citizen.phone,
        payment.application.land?.gov || '—',
        PAYMENT_LABELS[payment.type] || payment.type,
        payment.amount,
        payment.receiptNumber || '—',
        payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('ar-EG') : '—',
        new Date(payment.createdAt).toLocaleDateString('ar-EG'),
        payment.notes || '—',
      ])
    }),
    csvRow(['الإجمالي', '', '', '', '', '', totalAmount]),
  ]

  await logAudit({
    userId: session.id,
    branchId: Object.keys(branchScope).length > 0
      ? (branchScope as { branchId: string }).branchId
      : null,
    actorBranchId: session.branchId,
    action: 'CSV_EXPORT_PAYMENTS',
    entity: 'Report',
    newValue: { count: payments.length, totalAmount },
  })

  return new NextResponse(`\uFEFF${rows.join('\r\n')}\r\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}