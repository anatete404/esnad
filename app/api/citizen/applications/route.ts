import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCitizenSession } from '@/lib/auth'
import { generateTrackingNumber, calcFaddan } from '@/lib/utils'
import { logAudit } from '@/lib/audit'
import { sendEmail, applicationReceivedEmail } from '@/lib/email'

const landSchema = z.object({
  gov: z.string().min(2, 'المحافظة مطلوبة'),
  center: z.string().optional(),
  village: z.string().optional(),
  detail: z.string().optional(),
  faddan: z.number().min(0).default(0),
  qirat: z.number().min(0).max(23).default(0),
  sahm: z.number().min(0).max(575).default(0),
  lat: z.string().optional(),
  lng: z.string().optional(),
  handDate: z.string().optional(),
  handReason: z.string().optional(),
  activity: z.string().optional(),
  waterSource: z.string().optional(),
  landStatus: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getCitizenSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const applications = await prisma.application.findMany({
    where: { citizenId: session.id },
    include: {
      land: true,
      documents: true,
      contract: true,
      stages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { submittedAt: 'desc' },
  })

  return NextResponse.json({ applications })
}

export async function POST(req: Request) {
  const session = await getCitizenSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = landSchema.parse(body)

    const activeCount = await prisma.application.count({
      where: {
        citizenId: session.id,
        status: { in: ['ACTIVE', 'ON_HOLD'] },
      },
    })

    if (activeCount >= 5) {
      return NextResponse.json(
        { error: 'لا يمكنك تقديم أكثر من 5 طلبات نشطة في نفس الوقت' },
        { status: 400 }
      )
    }

    const totalFaddan = calcFaddan(data.faddan, data.qirat, data.sahm)

    let trackingNumber = generateTrackingNumber()
    let attempts = 0
    while (attempts < 5) {
      const exists = await prisma.application.findUnique({
        where: { trackingNumber },
      })
      if (!exists) break
      trackingNumber = generateTrackingNumber()
      attempts++
    }

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          trackingNumber,
          citizenId: session.id,
          stage: 'SUBMITTED',
          status: 'ACTIVE',
          notes: data.notes || null,
          land: {
            create: {
              gov: data.gov,
              center: data.center || null,
              village: data.village || null,
              detail: data.detail || null,
              faddan: data.faddan,
              qirat: data.qirat,
              sahm: data.sahm,
              totalFaddan,
              lat: data.lat || null,
              lng: data.lng || null,
              handDate: data.handDate ? new Date(data.handDate) : null,
              handReason: data.handReason || null,
              activity: data.activity || null,
              waterSource: data.waterSource || null,
              landStatus: data.landStatus || null,
            },
          },
        },
        include: { land: true },
      })

      await tx.stageHistory.create({
        data: {
          applicationId: app.id,
          fromStage: null,
          toStage: 'SUBMITTED',
          action: 'SUBMIT',
          notes: 'تم تقديم الطلب من المواطن',
        },
      })

      await tx.notification.create({
        data: {
          citizenId: session.id,
          applicationId: app.id,
          title: 'تم استلام طلبك بنجاح',
          body: `رقم التتبع: ${trackingNumber}`,
        },
      })

      return app
    })

    await logAudit({
      action: 'APPLICATION_CREATE',
      entity: 'Application',
      entityId: application.id,
      newValue: {
        trackingNumber,
        gov: data.gov,
        totalFaddan,
      },
    })

    // Send email to citizen (non-blocking)
    const citizenForEmail = await prisma.citizen.findUnique({
      where: { id: session.id },
      select: { email: true, fullName: true },
    })
    if (citizenForEmail?.email) {
      const { subject, html } = applicationReceivedEmail({
        fullName: citizenForEmail.fullName,
        trackingNumber,
      })
      sendEmail({ to: citizenForEmail.email, subject, html }).catch((err) => {
        console.error('[application-create] email failed:', err)
      })
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        trackingNumber: application.trackingNumber,
        totalFaddan: application.land?.totalFaddan,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[application-create]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
