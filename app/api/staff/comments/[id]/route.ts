import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const comment = await prisma.applicationComment.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      applicationId: true,
      content: true,
      application: { select: { branchId: true } },
    },
  })

  if (!comment) {
    return NextResponse.json({ error: 'الرسالة غير موجودة' }, { status: 404 })
  }

  if (comment.authorId !== session.id && session.roleKey !== 'admin') {
    return NextResponse.json({ error: 'لا تملك صلاحية حذف هذه الرسالة' }, { status: 403 })
  }

  await prisma.applicationComment.delete({ where: { id } })

  await logAudit({
    userId: session.id,
    branchId: comment.application.branchId,
    actorBranchId: session.branchId,
    action: 'COMMENT_DELETE',
    entity: 'ApplicationComment',
    entityId: id,
    oldValue: { applicationId: comment.applicationId, content: comment.content.slice(0, 100) },
  })

  return NextResponse.json({ success: true })
}
