import ExcelJS from 'exceljs'
import { NextResponse } from 'next/server'
import { can, scopeWhere } from '@/lib/rbac'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

const STATUS_LABELS = {
  active: 'نشط',
  inactive: 'معطل',
  terminated: 'منتهي',
} as const

type StatusFilter = keyof typeof STATUS_LABELS

function formatDate(value: Date | null): string {
  if (!value) return '—'
  return value.toISOString().slice(0, 16).replace('T', ' ')
}

export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const canManageAll = can(session, 'users.manage')
  const canManageBranch = can(session, 'users.manage.branch')
  if (!canManageAll && !canManageBranch) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }
  if (canManageBranch && !canManageAll && !session.branchId) {
    return NextResponse.json({ error: 'لا يوجد فرع مرتبط بحسابك' }, { status: 400 })
  }

  const { searchParams } = new URL(req.url)
  const requestedStatus = searchParams.get('status') || 'all'
  const status = requestedStatus === 'all' ? 'all' : requestedStatus as StatusFilter
  const q = searchParams.get('q')?.trim() || ''

  const where: Record<string, unknown> = {
    ...scopeWhere(session, 'BRANCH'),
  }
  if (status === 'active') where.isActive = true
  if (status === 'inactive') {
    where.isActive = false
    where.terminatedAt = null
  }
  if (status === 'terminated') where.terminatedAt = { not: null }
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { employeeNumber: { contains: q } },
      { nationalId: { contains: q } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      employeeNumber: true,
      fullName: true,
      email: true,
      phone: true,
      nationalId: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      terminatedAt: true,
      terminationReason: true,
      role: { select: { nameAr: true } },
      branch: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 5000,
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'منصة إسناد'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('الموظفون', {
    views: [{ rightToLeft: true }],
  })
  sheet.columns = [
    { header: 'الرقم الوظيفي', key: 'employeeNumber', width: 20 },
    { header: 'الاسم الكامل', key: 'fullName', width: 28 },
    { header: 'البريد الإلكتروني', key: 'email', width: 30 },
    { header: 'الهاتف', key: 'phone', width: 16 },
    { header: 'الرقم القومي', key: 'nationalId', width: 18 },
    { header: 'الدور', key: 'role', width: 20 },
    { header: 'الفرع', key: 'branch', width: 20 },
    { header: 'الحالة', key: 'status', width: 14 },
    { header: 'تاريخ التعيين', key: 'createdAt', width: 20 },
    { header: 'آخر دخول', key: 'lastLoginAt', width: 20 },
    { header: 'تاريخ الإنهاء', key: 'terminatedAt', width: 20 },
    { header: 'سبب الإنهاء', key: 'terminationReason', width: 28 },
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

  for (const user of users) {
    const userStatus = user.terminatedAt
      ? STATUS_LABELS.terminated
      : user.isActive
        ? STATUS_LABELS.active
        : STATUS_LABELS.inactive
    sheet.addRow({
      employeeNumber: user.employeeNumber || '—',
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '—',
      nationalId: user.nationalId || '—',
      role: user.role.nameAr,
      branch: user.branch?.name || '—',
      status: userStatus,
      createdAt: formatDate(user.createdAt),
      lastLoginAt: formatDate(user.lastLoginAt),
      terminatedAt: formatDate(user.terminatedAt),
      terminationReason: user.terminationReason || '—',
    })
  }

  for (let index = 2; index <= sheet.rowCount; index++) {
    const row = sheet.getRow(index)
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F5F3' },
      }
    }
    row.alignment = { vertical: 'middle', horizontal: 'right' }
    row.height = 24
  }

  const buffer = await workbook.xlsx.writeBuffer()
  await logAudit({
    userId: session.id,
    branchId: canManageAll ? null : session.branchId,
    actorBranchId: session.branchId,
    action: 'EXCEL_EXPORT_USERS',
    entity: 'User',
    newValue: { filters: { status: requestedStatus, q }, count: users.length },
  })

  const filename = `users-${new Date().toISOString().slice(0, 10)}.xlsx`
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
