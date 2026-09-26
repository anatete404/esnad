import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const RESULTS = ['MATCH', 'MISMATCH', 'NEEDS_FOLLOWUP'] as const

const schema = z.object({
  result: z.enum(RESULTS),
  notes: z.string().max(1000).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'surveys.submit')) {
    return NextResponse.json({ error: 'لا تملك صلاحية تسجيل المعاينة' }, { status: 403 })
  }

  const { id } = await params

  try {
    const data = schema.parse(await req.json())

    if (data.result === 'MISMATCH' && (!data.notes || data.notes.trim().length < 5)) {
      return NextResponse.json(
        { error: 'ملاحظات إجبارية (5 أحرف على الأقل) عند عدم المطابقة' },
        { status: 400 }
      )
    }

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, branchId: true, trackingNumber: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    const survey = await prisma.survey.findFirst({
      where: { applicationId: id, completedAt: null },
      orderBy: { createdAt: 'desc' },
    })

    if (!survey) {
      return NextResponse.json({ error: 'لا توجد معاينة مجدولة' }, { status: 404 })
    }

    if (survey.surveyorId !== session.id) {
      return NextResponse.json(
        { error: 'لست المساح المسند لهذه المعاينة' },
        { status: 403 }
      )
    }

    const updated = await prisma.survey.update({
      where: { id: survey.id },
      data: {
        completedAt: new Date(),
        result: data.result,
        notes: data.notes || null,
      },
    })

    await logAudit({
      userId: session.id,
      branchId: application.branchId,
      actorBranchId: session.branchId,
      action: 'SURVEY_COMPLETE',
      entity: 'Survey',
      entityId: survey.id,
      newValue: {
        applicationId: id,
        result: data.result,
      },
    })

    return NextResponse.json({ success: true, survey: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[survey-complete]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}