import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  const { trackingNumber } = await params

  if (!trackingNumber || trackingNumber.length < 5) {
    return NextResponse.json({ error: 'رقم تتبع غير صالح' }, { status: 400 })
  }

  const application = await prisma.application.findUnique({
    where: { trackingNumber },
    select: {
      id: true,
      trackingNumber: true,
      stage: true,
      status: true,
      submittedAt: true,
      updatedAt: true,
      completedAt: true,
      land: {
        select: {
          gov: true,
          center: true,
          village: true,
          detail: true,
          totalFaddan: true,
        },
      },
      stages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          fromStage: true,
          toStage: true,
          action: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  })

  if (!application) {
    return NextResponse.json(
      { error: 'لا يوجد طلب بهذا الرقم' },
      { status: 404 }
    )
  }

  return NextResponse.json({ application })
}
