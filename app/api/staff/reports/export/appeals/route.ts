import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'مقبول',
  REJECTED: 'مرفوض',
}

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'appeals.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const branchScope = scopeWhere(session, 'BRANCH')
  const where: Record<string, unknown> = {}
  if (Object.keys(branchScope).length > 0) {
    where.application = { branchId: (branchScope as { branchId: string }).branchId }
  }

  const appeals = await prisma.appeal.findMany({
    where,
    include: {
      application: { select: { trackingNumber: true } },
      citizen: { select: { fullName: true, nationalId: true, phone: true } },
      reviewedBy: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'منصة إسناد للتنمية الزراعية'
  const sheet = workbook.addWorksheet('التظلمات', { views: [{ rightToLeft: true }] })

  sheet.columns = [
    { header: 'رقم الطلب', key: 'trackingNumber', width: 24 },
    { header: 'اسم المواطن', key: 'citizenName', width: 28 },
    { header: 'الرقم القومي', key: 'nationalId', width: 18 },
    { header: 'الهاتف', key: 'phone', width: 14 },
    { header: 'سبب التظلم', key: 'reason', width: 40 },
    { header: 'الحالة', key: 'status', width: 16 },
    { header: 'المُراجع', key: 'reviewer', width: 24 },
    { header: 'تاريخ القرار', key: 'reviewedAt', width: 14 },
    { header: 'ملاحظات المراجع', key: 'decisionNotes', width: 40 },
    { header: 'تاريخ التقديم', key: 'createdAt', width: 14 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC89A2C' } }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 30

  let pending = 0
  let approved = 0
  let rejected = 0

  for (const a of appeals) {
    if (a.status === 'PENDING') pending++
    else if (a.status === 'APPROVED') approved++
    else if (a.status === 'REJECTED') rejected++

    sheet.addRow({
      trackingNumber: a.application.trackingNumber,
      citizenName: a.citizen.fullName,
      nationalId: a.citizen.nationalId,
      phone: a.citizen.phone,
      reason: a.reason,
      status: STATUS_LABELS[a.status] || a.status,
      reviewer: a.reviewedBy?.fullName || '—',
      reviewedAt: a.reviewedAt ? new Date(a.reviewedAt).toLocaleDateString('ar-EG') : '—',
      decisionNotes: a.decisionNotes || '—',
      createdAt: new Date(a.createdAt).toLocaleDateString('ar-EG'),
    })
  }

  const info = workbook.addWorksheet('معلومات', { views: [{ rightToLeft: true }] })
  info.columns = [
    { header: 'البند', key: 'k', width: 30 },
    { header: 'القيمة', key: 'v', width: 40 },
  ]
  info.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  info.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC89A2C' } }
  info.addRow({ k: 'نوع التقرير', v: 'تقرير التظلمات' })
  info.addRow({ k: 'تاريخ الإنشاء', v: new Date().toLocaleString('ar-EG') })
  info.addRow({ k: 'الموظف', v: session.fullName })
  info.addRow({ k: 'الإجمالي', v: appeals.length })
  info.addRow({ k: 'قيد المراجعة', v: pending })
  info.addRow({ k: 'مقبول', v: approved })
  info.addRow({ k: 'مرفوض', v: rejected })

  const buffer = await workbook.xlsx.writeBuffer()

  await logAudit({
    userId: session.id,
    action: 'EXCEL_EXPORT_APPEALS',
    entity: 'Report',
    newValue: { count: appeals.length },
  })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="appeals-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}
