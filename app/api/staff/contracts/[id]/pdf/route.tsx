import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'
import { ContractPdf } from '@/lib/contractPdf'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'contracts.create') && !can(session, 'applications.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          citizen: { select: { fullName: true, nationalId: true, phone: true } },
          land: true,
        },
      },
    },
  })

  if (!contract) {
    return NextResponse.json({ error: 'العقد غير موجود' }, { status: 404 })
  }

  const data = {
    contractNo: contract.contractNo,
    createdAt: new Date(contract.createdAt).toLocaleDateString('ar-EG'),
    signedAt: contract.signedAt
      ? new Date(contract.signedAt).toLocaleDateString('ar-EG')
      : null,
    value: contract.value,
    paymentPlan: contract.paymentPlan,
    citizen: {
      fullName: contract.application.citizen.fullName,
      nationalId: contract.application.citizen.nationalId,
      phone: contract.application.citizen.phone,
    },
    land: contract.application.land
      ? {
          gov: contract.application.land.gov,
          center: contract.application.land.center,
          village: contract.application.land.village,
          detail: contract.application.land.detail,
          totalFaddan: contract.application.land.totalFaddan,
          authorityName: contract.application.land.authorityName,
        }
      : null,
    trackingNumber: contract.application.trackingNumber,
  }

  const pdfBuffer = await renderToBuffer(<ContractPdf data={data} />)
  const pdfBytes = new Uint8Array(pdfBuffer)

  await logAudit({
    userId: session.id,
    action: 'CONTRACT_PDF_DOWNLOAD',
    entity: 'Contract',
    entityId: id,
  })

  const filename = `contract-${contract.contractNo}.pdf`

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
