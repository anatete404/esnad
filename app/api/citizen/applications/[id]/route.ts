import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCitizenSession } from '@/lib/auth'

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
      land: true,
      documents: { orderBy: { uploadedAt: 'desc' } },
      stages: { orderBy: { createdAt: 'asc' } },
      contract: true,
    },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ application })
}
