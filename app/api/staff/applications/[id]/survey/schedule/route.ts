import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  surveyorId: z.string().min(1, 'يجب اختيار مساح'),
  scheduledAt: z.string().min(1, 'موعد المعاينة مطلوب'),
  notes: z.string().max(500).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'surveys.schedule')) {
    return NextResponse.json({ error: 'لا تملك صلاحية جدولة المعاينة' }, { status: 403 })
  }

  const { id } = await params

  try {
    const data = schema.parse(await req.json())

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, branchId: true, trackingNumber: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (
      session.roleKey !== 'admin' &&
      application.branchId &&
      application.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
    }

    const surveyor = await prisma.user.findUnique({
      where: { id: data.surveyorId },
      select: {
        id: true,
        fullName: true,
        isActive: true,
        terminatedAt: true,
        branchId: true,
        role: { select: { key: true } },
      },
    })

    if (
      !surveyor ||
      surveyor.role.key !== 'surveyor' ||
      !surveyor.isActive ||
      surveyor.terminatedAt
    ) {
      return NextResponse.json({ error: 'المساح غير صالح' }, { status: 400 })
    }

    if (
      session.roleKey !== 'admin' &&
      surveyor.branchId &&
      surveyor.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'المساح في فرع آخر' }, { status: 400 })
    }

    const existing = await prisma.survey.findFirst({
      where: { applicationId: id, completedAt: null },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'يوجد معاينة مجدولة بالفعل' },
        { status: 400 }
      )
    }

    const scheduledAt = new Date(data.scheduledAt)
    if (isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: 'موعد غير صالح' }, { status: 400 })
    }

    const survey = await prisma.survey.create({
      data: {
        applicationId: id,
        surveyorId: data.surveyorId,
        scheduledAt,
        notes: data.notes || null,
      },
      include: {
        surveyor: { select: { id: true, fullName: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: surveyor.id,
        applicationId: id,
        title: 'معاينة مجدولة',
        body: `تم تكليفك بمعاينة الطلب ${application.trackingNumber}`,
      },
    })

    await logAudit({
      userId: session.id,
      branchId: application.branchId,
      actorBranchId: session.branchId,
      action: 'SURVEY_SCHEDULE',
      entity: 'Survey',
      entityId: survey.id,
      newValue: {
        applicationId: id,
        surveyorId: data.surveyorId,
        scheduledAt: scheduledAt.toISOString(),
      },
    })

    return NextResponse.json({ success: true, survey })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[survey-schedule]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}