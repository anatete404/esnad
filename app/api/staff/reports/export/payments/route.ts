import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
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

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'منصة إسناد للتنمية الزراعية'
  const sheet = workbook.addWorksheet('المدفوعات', { views: [{ rightToLeft: true }] })

  sheet.columns = [
    { header: 'رقم التتبع', key: 'trackingNumber', width: 24 },
    { header: 'اسم المواطن', key: 'citizenName', width: 28 },
    { header: 'الرقم القومي', key: 'nationalId', width: 18 },
    { header: 'الهاتف', key: 'phone', width: 14 },
    { header: 'المحافظة', key: 'gov', width: 14 },
    { header: 'نوع الرسوم', key: 'type', width: 18 },
    { header: 'المبلغ', key: 'amount', width: 14 },
    { header: 'رقم الإيصال', key: 'receiptNumber', width: 20 },
    { header: 'تاريخ الدفع', key: 'paidAt', width: 14 },
    { header: 'تاريخ التسجيل', key: 'createdAt', width: 14 },
    { header: 'ملاحظات', key: 'notes', width: 30 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D7A3E' } }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 30

  let totalAmount = 0

  for (const p of payments) {
    totalAmount += p.amount
    sheet.addRow({
      trackingNumber: p.application.trackingNumber,
      citizenName: p.application.citizen.fullName,
      nationalId: p.application.citizen.nationalId,
      phone: p.application.citizen.phone,
      gov: p.application.land?.gov || '—',
      type: PAYMENT_LABELS[p.type] || p.type,
      amount: p.amount,
      receiptNumber: p.receiptNumber || '—',
      paidAt: p.paidAt ? new Date(p.paidAt).toLocaleDateString('ar-EG') : '—',
      createdAt: new Date(p.createdAt).toLocaleDateString('ar-EG'),
      notes: p.notes || '—',
    })
  }

  const totalRow = sheet.addRow({
    trackingNumber: 'الإجمالي',
    amount: totalAmount,
  })
  totalRow.font = { bold: true, size: 13 }
  totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FAF4' } }

  const info = workbook.addWorksheet('معلومات', { views: [{ rightToLeft: true }] })
  info.columns = [
    { header: 'البند', key: 'k', width: 30 },
    { header: 'القيمة', key: 'v', width: 40 },
  ]
  info.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  info.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D7A3E' } }
  info.addRow({ k: 'نوع التقرير', v: 'تقرير المدفوعات' })
  info.addRow({ k: 'تاريخ الإنشاء', v: new Date().toLocaleString('ar-EG') })
  info.addRow({ k: 'الموظف', v: session.fullName })
  info.addRow({ k: 'عدد الدفعات', v: payments.length })
  info.addRow({ k: 'إجمالي المبالغ', v: totalAmount.toLocaleString('ar-EG') + ' ج.م' })

  const buffer = await workbook.xlsx.writeBuffer()

  await logAudit({
    userId: session.id,
    branchId: Object.keys(branchScope).length > 0
      ? (branchScope as { branchId: string }).branchId
      : null,
    actorBranchId: session.branchId,
    action: 'EXCEL_EXPORT_PAYMENTS',
    entity: 'Report',
    newValue: { count: payments.length, totalAmount },
  })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}
