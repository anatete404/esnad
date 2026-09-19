import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { scopeWhere } from '@/lib/rbac'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (session.roleKey !== 'admin' && session.roleKey !== 'branch_manager') {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const branchScope = scopeWhere(session, 'BRANCH')
  const branchId =
    typeof branchScope === 'object' && branchScope && 'branchId' in branchScope
      ? String(branchScope.branchId)
      : undefined

  const branchFilter = branchId ? { branchId } : {}

  try {
    const [
      totalApplications,
      completedApplications,
      activeApplications,
      onHoldApplications,
      rejectedApplications,
      totalCitizens,
      totalAppeals,
      pendingAppeals,
      totalContracts,
      unsignedContracts,
      totalUsers,
      totalBranches,
      paymentTotal,
      applicationsForMonths,
      branchesWithStats,
      topStaff,
      recentApplications,
    ] = await Promise.all([
      prisma.application.count({ where: branchFilter }),
      prisma.application.count({ where: { ...branchFilter, status: 'COMPLETED' } }),
      prisma.application.count({ where: { ...branchFilter, status: 'ACTIVE' } }),
      prisma.application.count({ where: { ...branchFilter, status: 'ON_HOLD' } }),
      prisma.application.count({ where: { ...branchFilter, status: 'REJECTED' } }),
      prisma.citizen.count(),
      prisma.appeal.count({
        where: branchId ? { application: { is: { branchId } } } : {},
      }),
      prisma.appeal.count({
        where: branchId
          ? { application: { is: { branchId } }, status: 'PENDING' }
          : { status: 'PENDING' },
      }),
      prisma.contract.count({
        where: branchId ? { application: { is: { branchId } } } : {},
      }),
      prisma.contract.count({
        where: branchId
          ? { application: { is: { branchId } }, signedAt: null }
          : { signedAt: null },
      }),
      prisma.user.count({ where: { ...(branchId ? { branchId } : {}), isActive: true } }),
      prisma.branch.count({ where: branchId ? { id: branchId } : {} }),
      prisma.payment.aggregate({
        where: branchId ? { application: { is: { branchId } } } : {},
        _sum: { amount: true },
      }),
      prisma.application.findMany({
        where: branchFilter,
        select: { submittedAt: true },
      }),
      prisma.branch.findMany({
        where: branchId ? { id: branchId } : {},
        include: {
          _count: {
            select: {
              applications: true,
              users: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { ...(branchId ? { branchId } : {}), isActive: true },
        select: {
          id: true,
          fullName: true,
          role: { select: { nameAr: true, key: true } },
          branch: { select: { name: true } },
          _count: { select: { assignedApps: true } },
        },
        orderBy: { assignedApps: { _count: 'desc' } },
        take: 8,
      }),
      prisma.application.findMany({
        where: branchFilter,
        take: 5,
        orderBy: { submittedAt: 'desc' },
        include: {
          citizen: { select: { fullName: true } },
          branch: { select: { name: true } },
          land: { select: { gov: true } },
        },
      }),
    ])

    const monthly = (() => {
      const months = Array.from({ length: 6 }, (_, index) => {
        const d = new Date()
        d.setDate(1)
        d.setMonth(d.getMonth() - index)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      }).reverse()

      const counts = new Map<string, number>()
      for (const item of applicationsForMonths) {
        const date = new Date(item.submittedAt)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }

      return months.map((month) => ({ month, count: counts.get(month) ?? 0 }))
    })()

    const completionRate = totalApplications
      ? Math.round((completedApplications / totalApplications) * 100)
      : 0

    return NextResponse.json({
      stats: {
        totalApplications,
        completedApplications,
        activeApplications,
        onHoldApplications,
        rejectedApplications,
        completionRate,
        totalCitizens,
        totalAppeals,
        pendingAppeals,
        totalContracts,
        unsignedContracts,
        totalUsers,
        totalBranches,
        totalPaymentsAmount: paymentTotal._sum.amount || 0,
      },
      monthly,
      branches: branchesWithStats.map((b) => ({
        id: b.id,
        name: b.name,
        city: b.city,
        applications: b._count.applications,
        users: b._count.users,
      })),
      topStaff: topStaff.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        role: s.role.nameAr,
        roleKey: s.role.key,
        branch: s.branch?.name || '—',
        completedCount: s._count.assignedApps,
      })),
      recentApplications: recentApplications.map((a) => ({
        id: a.id,
        trackingNumber: a.trackingNumber,
        citizenName: a.citizen.fullName,
        branch: a.branch?.name || '—',
        gov: a.land?.gov || '—',
        submittedAt: a.submittedAt,
      })),
    })
  } catch (err) {
    console.error('[owner-dashboard]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
