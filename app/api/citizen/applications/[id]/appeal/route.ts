import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCitizenSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

const createSchema = z.object({
  reason: z.string().min(10, 'السبب قصير جداً — 10 أحرف على الأقل').max(200),
  details: z.string().max(2000).optional(),
})

// GET: عرض التظلم الحالي للطلب
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCitizenSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params

  const application = await prisma.application.findFirst({
    where: { id, citizenId: session.id },
    select: { id: true, appeal: true },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ appeal: application.appeal })
}

// POST: تقديم تظلم جديد
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCitizenSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = createSchema.parse(body)

    const application = await prisma.application.findFirst({
      where: { id, citizenId: session.id },
      select: { id: true, status: true, branchId: true, appeal: true, trackingNumber: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (application.appeal) {
      return NextResponse.json({ error: 'يوجد تظلم مقدم بالفعل لهذا الطلب' }, { status: 400 })
    }

    if (application.status !== 'REJECTED') {
      return NextResponse.json(
        { error: 'لا يمكن التظلم إلا على الطلبات المرفوضة' },
        { status: 400 }
      )
    }

    const appeal = await prisma.appeal.create({
      data: {
        applicationId: id,
        citizenId: session.id,
        reason: data.reason,
        details: data.details || null,
        status: 'PENDING',
      },
    })

    await prisma.notification.create({
      data: {
        citizenId: session.id,
        applicationId: id,
        title: 'تم استلام تظلمك',
        body: `تظلمك على الطلب ${application.trackingNumber} قيد المراجعة`,
      },
    })

    await logAudit({
      branchId: application.branchId,
      actorBranchId: null,
      action: 'APPEAL_SUBMIT',
      entity: 'Appeal',
      entityId: appeal.id,
      newValue: { applicationId: id, reason: data.reason },
    })

    return NextResponse.json({ success: true, appeal }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[appeal-create]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
