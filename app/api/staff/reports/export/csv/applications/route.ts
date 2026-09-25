import { NextResponse } from 'next/server'
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

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(',')
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

  const rows = [
    csvRow([
      'رقم التتبع', 'تاريخ التقديم', 'اسم المواطن', 'الرقم القومي', 'الهاتف',
      'المحافظة', 'المركز', 'جهة الولاية', 'المساحة (فدان)', 'المرحلة',
      'الحالة', 'المستندات', 'الدفعات', 'مسند إلى',
    ]),
    ...applications.map((app) => csvRow([
      app.trackingNumber,
      new Date(app.submittedAt).toLocaleDateString('ar-EG'),
      app.citizen.fullName,
      app.citizen.nationalId,
      app.citizen.phone,
      app.land?.gov || '—',
      app.land?.center || '—',
      app.land?.authorityName || '—',
      app.land?.totalFaddan?.toFixed(4) || '0',
      STAGE_LABELS[app.stage] || app.stage,
      STATUS_LABELS[app.status] || app.status,
      app._count.documents,
      app._count.payments,
      app.assignedTo?.fullName || 'غير مسند',
    ])),
  ]

  await logAudit({
    userId: session.id,
    branchId: Object.keys(branchScope).length > 0
      ? (branchScope as { branchId: string }).branchId
      : null,
    actorBranchId: session.branchId,
    action: 'CSV_EXPORT_APPLICATIONS',
    entity: 'Report',
    newValue: { count: applications.length, filters: { stage, status, q } },
  })

  const filename = `applications-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(`\uFEFF${rows.join('\r\n')}\r\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}