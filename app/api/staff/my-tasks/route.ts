import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { scopeWhere } from '@/lib/rbac'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const branchScope = scopeWhere(session, 'BRANCH')
  const scopeFilter =
    Object.keys(branchScope).length > 0
      ? { branchId: (branchScope as { branchId: string }).branchId }
      : {}

  const role = session.roleKey

  const result = {
    role,
    tasks: [] as Array<{
      id: string
      type: string
      title: string
      subtitle: string
      href: string
      priority: 'high' | 'normal'
    }>,
    stats: {} as Record<string, number>,
  }

  if (role === 'receptionist' || role === 'data_entry') {
    const newApps = await prisma.application.findMany({
      where: {
        ...scopeFilter,
        stage: 'SUBMITTED',
      },
      select: {
        id: true,
        trackingNumber: true,
        citizen: { select: { fullName: true } },
        submittedAt: true,
      },
      orderBy: { submittedAt: 'asc' },
      take: 10,
    })

    result.stats = {
      newApplications: await prisma.application.count({
        where: { ...scopeFilter, stage: 'SUBMITTED' },
      }),
      incompleteDocs: await prisma.application.count({
        where: {
          ...scopeFilter,
          stage: 'DOCS_REVIEW',
        },
      }),
    }

    result.tasks = newApps.map((a) => ({
      id: a.id,
      type: 'new_application',
      title: `طلب جديد — ${a.trackingNumber}`,
      subtitle: a.citizen.fullName,
      href: `/portal/applications/${a.id}`,
      priority: 'high' as const,
    }))
  }

  if (role === 'reviewer' || role === 'supervisor') {
    const reviewApps = await prisma.application.findMany({
      where: {
        ...scopeFilter,
        OR: [
          { stage: 'INITIAL_REVIEW' },
          { stage: 'DOCS_REVIEW' },
        ],
        assignedToId: session.id,
      },
      select: {
        id: true,
        trackingNumber: true,
        stage: true,
        citizen: { select: { fullName: true } },
      },
      orderBy: { submittedAt: 'asc' },
      take: 10,
    })

    const unassignedReview = await prisma.application.findMany({
      where: {
        ...scopeFilter,
        stage: { in: ['INITIAL_REVIEW', 'DOCS_REVIEW'] },
        assignedToId: null,
      },
      select: {
        id: true,
        trackingNumber: true,
        citizen: { select: { fullName: true } },
      },
      take: 5,
    })

    result.stats = {
      assignedToMe: reviewApps.length,
      unassigned: await prisma.application.count({
        where: {
          ...scopeFilter,
          stage: { in: ['INITIAL_REVIEW', 'DOCS_REVIEW'] },
          assignedToId: null,
        },
      }),
      docsToVerify: await prisma.document.count({
        where: {
          application: scopeFilter,
          isVerified: false,
        },
      }),
    }

    result.tasks = [
      ...reviewApps.map((a) => ({
        id: a.id,
        type: 'review',
        title: `مراجعة مطلوبة — ${a.trackingNumber}`,
        subtitle: a.citizen.fullName,
        href: `/portal/applications/${a.id}`,
        priority: 'high' as const,
      })),
      ...unassignedReview.map((a) => ({
        id: a.id,
        type: 'unassigned',
        title: `طلب بدون إسناد — ${a.trackingNumber}`,
        subtitle: a.citizen.fullName,
        href: `/portal/applications/${a.id}`,
        priority: 'normal' as const,
      })),
    ]
  }

  if (role === 'surveyor') {
    const scheduledSurveys = await prisma.survey.findMany({
      where: {
        surveyorId: session.id,
        completedAt: null,
      },
      include: {
        application: {
          select: {
            id: true,
            trackingNumber: true,
            citizen: { select: { fullName: true } },
            land: { select: { gov: true, center: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    })

    result.stats = {
      scheduled: scheduledSurveys.length,
      completed: await prisma.survey.count({
        where: { surveyorId: session.id, completedAt: { not: null } },
      }),
    }

    result.tasks = scheduledSurveys.map((s) => ({
      id: s.application.id,
      type: 'survey',
      title: `معاينة — ${s.application.trackingNumber}`,
      subtitle: s.application.land?.gov
        ? `${s.application.land.gov} — ${s.application.land.center || ''}`
        : s.application.citizen.fullName,
      href: `/portal/applications/${s.application.id}`,
      priority: 'high' as const,
    }))
  }

  if (role === 'legal') {
    const contractReady = await prisma.application.findMany({
      where: {
        ...scopeFilter,
        stage: 'COMMITTEE',
      },
      select: {
        id: true,
        trackingNumber: true,
        citizen: { select: { fullName: true } },
      },
      take: 10,
    })

    result.stats = {
      readyForContract: contractReady.length,
      unsignedContracts: await prisma.contract.count({
        where: { signedAt: null },
      }),
    }

    result.tasks = contractReady.map((a) => ({
      id: a.id,
      type: 'contract',
      title: `عقد جاهز — ${a.trackingNumber}`,
      subtitle: a.citizen.fullName,
      href: `/portal/applications/${a.id}`,
      priority: 'high' as const,
    }))
  }

  if (role === 'accountant') {
    const recentPayments = await prisma.payment.findMany({
      where: {
        ...(Object.keys(branchScope).length > 0 ? { application: scopeFilter } : {}),
      },
      include: {
        application: {
          select: {
            id: true,
            trackingNumber: true,
            citizen: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    result.stats = {
      recentPayments: recentPayments.length,
      totalThisMonth: await prisma.payment.count({
        where: {
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          ...(Object.keys(branchScope).length > 0 ? { application: scopeFilter } : {}),
        },
      }),
    }

    result.tasks = recentPayments.map((p) => ({
      id: p.application.id,
      type: 'payment',
      title: `${p.type === 'inspection' ? 'رسوم فحص' : p.type === 'survey' ? 'رسوم معاينة' : 'دفعة'} — ${p.application.trackingNumber}`,
      subtitle: `${p.amount.toLocaleString('ar-EG')} ج.م — ${p.application.citizen.fullName}`,
      href: `/portal/applications/${p.application.id}`,
      priority: 'normal' as const,
    }))
  }

  if (role === 'branch_manager') {
    const pendingAppeals = await prisma.appeal.findMany({
      where: {
        status: 'PENDING',
        ...(Object.keys(branchScope).length > 0 ? { application: scopeFilter } : {}),
      },
      include: {
        application: { select: { id: true, trackingNumber: true } },
        citizen: { select: { fullName: true } },
      },
      take: 10,
    })

    const assignedApps = await prisma.application.findMany({
      where: {
        ...scopeFilter,
        assignedToId: session.id,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        trackingNumber: true,
        stage: true,
        citizen: { select: { fullName: true } },
      },
      take: 10,
    })

    result.stats = {
      pendingAppeals: pendingAppeals.length,
      assignedToMe: assignedApps.length,
      activeInBranch: await prisma.application.count({
        where: { ...scopeFilter, status: 'ACTIVE' },
      }),
    }

    result.tasks = [
      ...pendingAppeals.map((a) => ({
        id: a.id,
        type: 'appeal',
        title: `تظلم قيد المراجعة — ${a.application.trackingNumber}`,
        subtitle: a.citizen.fullName,
        href: `/portal/appeals/${a.id}`,
        priority: 'high' as const,
      })),
      ...assignedApps.map((a) => ({
        id: a.id,
        type: 'assigned',
        title: `طلب مسند إليك — ${a.trackingNumber}`,
        subtitle: a.citizen.fullName,
        href: `/portal/applications/${a.id}`,
        priority: 'normal' as const,
      })),
    ]
  }

  if (role === 'admin') {
    result.stats = {
      totalApplications: await prisma.application.count(),
      activeApplications: await prisma.application.count({ where: { status: 'ACTIVE' } }),
      pendingAppeals: await prisma.appeal.count({ where: { status: 'PENDING' } }),
      activeUsers: await prisma.user.count({ where: { isActive: true } }),
    }

    const recent = await prisma.application.findMany({
      orderBy: { submittedAt: 'desc' },
      take: 5,
      include: {
        citizen: { select: { fullName: true } },
      },
    })

    result.tasks = recent.map((a) => ({
      id: a.id,
      type: 'recent',
      title: `آخر طلب — ${a.trackingNumber}`,
      subtitle: a.citizen.fullName,
      href: `/portal/applications/${a.id}`,
      priority: 'normal' as const,
    }))
  }

  return NextResponse.json(result)
}
