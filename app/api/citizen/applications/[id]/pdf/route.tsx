import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { prisma } from '@/lib/prisma'
import { getCitizenSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { ApplicationFilePdf } from '@/lib/applicationFilePdf'

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
    include: {
      citizen: {
        select: {
          fullName: true,
          nationalId: true,
          phone: true,
          gov: true,
          center: true,
        },
      },
      land: true,
      documents: { orderBy: { uploadedAt: 'desc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      stages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  const data = {
    trackingNumber: application.trackingNumber,
    status: application.status,
    stage: application.stage,
    submittedAt: new Date(application.submittedAt).toLocaleDateString('ar-EG'),
    citizen: {
      fullName: application.citizen.fullName,
      nationalId: application.citizen.nationalId,
      phone: application.citizen.phone,
      gov: application.citizen.gov,
      center: application.citizen.center,
    },
    land: application.land
      ? {
          gov: application.land.gov,
          center: application.land.center,
          village: application.land.village,
          detail: application.land.detail,
          totalFaddan: application.land.totalFaddan,
          authorityName: application.land.authorityName,
          lat: application.land.lat,
          lng: application.land.lng,
        }
      : null,
    documents: application.documents.map((d) => ({
      originalName: d.originalName,
      type: d.type,
      isVerified: d.isVerified,
    })),
    payments: application.payments.map((p) => ({
      type: p.type,
      amount: p.amount,
      receiptNumber: p.receiptNumber,
    })),
    stages: application.stages.map((s) => ({
      toStage: s.toStage,
      action: s.action,
      notes: s.notes,
      createdAt: s.createdAt.toISOString(),
    })),
  }

  const pdfBuffer = await renderToBuffer(<ApplicationFilePdf data={data} />)

  await logAudit({
    branchId: application.branchId ?? null,
    actorBranchId: null,
    action: 'APPLICATION_PDF_DOWNLOAD',
    entity: 'Application',
    entityId: id,
  })

  const filename = `application-${application.trackingNumber}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
