import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const STAGE_LABELS: Record<string, string> = {
  SUBMITTED: 'تم التقديم',
  INITIAL_REVIEW: 'مراجعة أولية',
  DOCS_REVIEW: 'فحص المستندات',
  SURVEY: 'معاينة ميدانية',
  PRICING: 'تسعير',
  COMMITTEE: 'عرض على اللجنة',
  CONTRACT: 'تعاقد',
  COMPLETED: 'منجز',
  REJECTED: 'مرفوض',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  ON_HOLD: 'معلّق',
  COMPLETED: 'منجز',
  REJECTED: 'مرفوض',
}

export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  const branchScope = scopeWhere(session, 'BRANCH')
  if (!can(session, 'reports.view') && !can(session, 'applications.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage') || ''
  const status = searchParams.get('status') || ''
  const q = searchParams.get('q')?.trim() || ''

  const where: Record<string, unknown> = {
    ...scopeWhere(session, 'BRANCH'),
  }
  if (stage) where.stage = stage
  if (status) where.status = status
  if (q) {
    where.OR = [
      { trackingNumber: { contains: q } },
      { citizen: { fullName: { contains: q } } },
      { citizen: { nationalId: { contains: q } } },
      { land: { gov: { contains: q } } },
    ]
  }

  const applications = await prisma.application.findMany({
    where,
    include: {
      citizen: { select: { fullName: true, nationalId: true, phone: true } },
      land: { select: { gov: true, center: true, village: true, totalFaddan: true, authorityName: true } },
      assignedTo: { select: { fullName: true } },
      _count: { select: { documents: true, payments: true } },
    },
    orderBy: { submittedAt: 'desc' },
    take: 5000,
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'منصة إسناد للتنمية الزراعية'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('الطلبات', {
    views: [{ rightToLeft: true }],
  })

  sheet.columns = [
    { header: 'رقم التتبع', key: 'trackingNumber', width: 24 },
    { header: 'تاريخ التقديم', key: 'submittedAt', width: 14 },
    { header: 'اسم المواطن', key: 'citizenName', width: 28 },
    { header: 'الرقم القومي', key: 'nationalId', width: 18 },
    { header: 'الهاتف', key: 'phone', width: 14 },
    { header: 'المحافظة', key: 'gov', width: 14 },
    { header: 'المركز', key: 'center', width: 16 },
    { header: 'جهة الولاية', key: 'authority', width: 22 },
    { header: 'المساحة (فدان)', key: 'faddan', width: 14 },
    { header: 'المرحلة', key: 'stage', width: 18 },
    { header: 'الحالة', key: 'status', width: 12 },
    { header: 'المستندات', key: 'docsCount', width: 12 },
    { header: 'الدفعات', key: 'paymentsCount', width: 10 },
    { header: 'مسند إلى', key: 'assignedTo', width: 22 },
  ]

  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D7A3E' },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 30

  for (const app of applications) {
    sheet.addRow({
      trackingNumber: app.trackingNumber,
      submittedAt: new Date(app.submittedAt).toLocaleDateString('ar-EG'),
      citizenName: app.citizen.fullName,
      nationalId: app.citizen.nationalId,
      phone: app.citizen.phone,
      gov: app.land?.gov || '—',
      center: app.land?.center || '—',
      authority: app.land?.authorityName || '—',
      faddan: app.land?.totalFaddan?.toFixed(4) || '0',
      stage: STAGE_LABELS[app.stage] || app.stage,
      status: STATUS_LABELS[app.status] || app.status,
      docsCount: app._count.documents,
      paymentsCount: app._count.payments,
      assignedTo: app.assignedTo?.fullName || 'غير مسند',
    })
  }

  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i)
    if (i % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F5F3' },
      }
    }
    row.alignment = { vertical: 'middle', horizontal: 'right' }
    row.height = 24
  }

  const infoSheet = workbook.addWorksheet('معلومات التقرير', {
    views: [{ rightToLeft: true }],
  })
  infoSheet.columns = [
    { header: 'البند', key: 'key', width: 30 },
    { header: 'القيمة', key: 'value', width: 40 },
  ]
  infoSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  infoSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D7A3E' },
  }
  infoSheet.addRow({ key: 'الجهة', value: 'منصة إسناد للتنمية الزراعية' })
  infoSheet.addRow({ key: 'نوع التقرير', value: 'قائمة الطلبات' })
  infoSheet.addRow({ key: 'تاريخ الإنشاء', value: new Date().toLocaleString('ar-EG') })
  infoSheet.addRow({ key: 'الموظف', value: session.fullName })
  infoSheet.addRow({ key: 'عدد السجلات', value: applications.length })
  infoSheet.addRow({ key: 'فلتر المرحلة', value: stage ? STAGE_LABELS[stage] || stage : 'الكل' })
  infoSheet.addRow({ key: 'فلتر الحالة', value: status ? STATUS_LABELS[status] || status : 'الكل' })
  infoSheet.addRow({ key: 'فلتر البحث', value: q || '—' })

  const buffer = await workbook.xlsx.writeBuffer()

  await logAudit({
    userId: session.id,
    branchId: Object.keys(branchScope).length > 0
      ? (branchScope as { branchId: string }).branchId
      : null,
    actorBranchId: session.branchId,
    action: 'EXCEL_EXPORT_APPLICATIONS',
    entity: 'Report',
    newValue: { count: applications.length, filters: { stage, status, q } },
  })

  const filename = `applications-${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
