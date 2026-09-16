import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!can(session, 'documents.verify')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id, docId } = await params

  try {
    const body = await req.json().catch(() => ({}))
    const verify = body.verify === true
    const notes = typeof body.notes === 'string' ? body.notes : null

    const doc = await prisma.document.findFirst({
      where: { id: docId, applicationId: id },
      select: { id: true, isVerified: true },
    })

    if (!doc) {
      return NextResponse.json({ error: 'المستند غير موجود' }, { status: 404 })
    }

    const updated = await prisma.document.update({
      where: { id: docId },
      data: {
        isVerified: verify,
        verifiedById: verify ? session.id : null,
        verifiedAt: verify ? new Date() : null,
        notes,
      },
      select: {
        id: true,
        isVerified: true,
        verifiedAt: true,
      },
    })

    await logAudit({
      userId: session.id,
      action: verify ? 'DOCUMENT_VERIFY' : 'DOCUMENT_UNVERIFY',
      entity: 'Document',
      entityId: docId,
      newValue: { isVerified: verify, notes, applicationId: id },
    })

    return NextResponse.json({ success: true, document: updated })
  } catch (err) {
    console.error('[doc-verify]', err)
    return NextResponse.json({ error: 'خطأ في العملية' }, { status: 500 })
  }
}
