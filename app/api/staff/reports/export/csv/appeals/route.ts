import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  APPROVED: 'مقبول',
  REJECTED: 'مرفوض',
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

  const rows = [
    csvRow([
      'رقم الطلب', 'اسم المواطن', 'الرقم القومي', 'الهاتف', 'سبب التظلم',
      'الحالة', 'المُراجع', 'تاريخ القرار', 'ملاحظات المراجع', 'تاريخ التقديم',
    ]),
    ...appeals.map((appeal) => csvRow([
      appeal.application.trackingNumber,
      appeal.citizen.fullName,
      appeal.citizen.nationalId,
      appeal.citizen.phone,
      appeal.reason,
      STATUS_LABELS[appeal.status] || appeal.status,
      appeal.reviewedBy?.fullName || '—',
      appeal.reviewedAt ? new Date(appeal.reviewedAt).toLocaleDateString('ar-EG') : '—',
      appeal.decisionNotes || '—',
      new Date(appeal.createdAt).toLocaleDateString('ar-EG'),
    ])),
  ]

  await logAudit({
    userId: session.id,
    action: 'CSV_EXPORT_APPEALS',
    entity: 'Report',
    newValue: { count: appeals.length },
  })

  return new NextResponse(`\uFEFF${rows.join('\r\n')}\r\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="appeals-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}