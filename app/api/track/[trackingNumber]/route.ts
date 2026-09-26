import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  TRACK_IDENTITY_COOKIE,
  TRACK_IDENTITY_MAX_AGE,
  normalizePhone,
  createTrackIdentityToken,
  verifyTrackIdentityToken,
} from '@/lib/trackIdentity'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  const { trackingNumber } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get(TRACK_IDENTITY_COOKIE)?.value

  if (!token) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const valid = await verifyTrackIdentityToken(token, trackingNumber)
  if (!valid) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

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
      rejectionReason: true,
      rejectedAt: true,
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  const { trackingNumber } = await params
  const { nationalId, phone, gov } = await request.json()

  if (
    typeof nationalId !== 'string' ||
    !/^\d{14}$/.test(nationalId) ||
    typeof phone !== 'string' ||
    !phone.trim() ||
    typeof gov !== 'string' ||
    !gov.trim()
  ) {
    return NextResponse.json(
      { ok: false, error: 'بيانات التحقق غير صحيحة' },
      { status: 400 }
    )
  }

  const application = await prisma.application.findUnique({
    where: { trackingNumber },
    include: { citizen: true },
  })

  if (!application) {
    return NextResponse.json(
      { ok: false, error: 'بيانات التحقق غير صحيحة' },
      { status: 404 }
    )
  }

  const nationalIdMatch = application.citizen.nationalId === nationalId
  const phoneMatch =
    normalizePhone(application.citizen.phone) === normalizePhone(phone)
  const govMatch =
    application.citizen.gov === null || application.citizen.gov === gov

  if (!nationalIdMatch || !phoneMatch || !govMatch) {
    return NextResponse.json(
      { ok: false, error: 'بيانات التحقق غير صحيحة' },
      { status: 401 }
    )
  }

  const token = await createTrackIdentityToken(trackingNumber)
  const cookieStore = await cookies()
  cookieStore.set(TRACK_IDENTITY_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TRACK_IDENTITY_MAX_AGE,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
