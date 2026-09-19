import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const createSchema = z.object({
  content: z.string().min(1, 'الرسالة فارغة').max(2000, 'الرسالة طويلة جداً'),
  mentionedIds: z.array(z.string()).max(10).optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'applications.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params
  const application = await prisma.application.findUnique({
    where: { id },
    select: { id: true, branchId: true },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  if (
    session.roleKey !== 'admin' &&
    session.roleKey !== 'authority_viewer' &&
    application.branchId &&
    application.branchId !== session.branchId
  ) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const comments = await prisma.applicationComment.findMany({
    where: { applicationId: id },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          role: { select: { nameAr: true } },
        },
      },
    },
  })

  return NextResponse.json({
    comments: comments.map((comment) => ({
      ...comment,
      mentionedIds: comment.mentionedIds
        ? comment.mentionedIds.split(',').filter(Boolean)
        : [],
    })),
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'applications.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  try {
    const data = createSchema.parse(await req.json())
    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, branchId: true, trackingNumber: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (
      session.roleKey !== 'admin' &&
      application.branchId &&
      application.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
    }

    const mentionedIds = data.mentionedIds?.slice(0, 10).join(',') || null
    const comment = await prisma.applicationComment.create({
      data: {
        applicationId: id,
        authorId: session.id,
        content: data.content.trim(),
        mentionedIds,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: { select: { nameAr: true } },
          },
        },
      },
    })

    if (data.mentionedIds && data.mentionedIds.length > 0) {
      const mentionRecipients = data.mentionedIds.filter((uid) => uid !== session.id)
      if (mentionRecipients.length > 0) {
        await Promise.all(
          mentionRecipients.map((uid) =>
            prisma.notification.create({
              data: {
                userId: uid,
                applicationId: id,
                title: `${session.fullName} أشار إليك في الطلب ${application.trackingNumber}`,
                body: data.content.slice(0, 200),
              },
            }),
          ),
        )
      }
    }

    await logAudit({
      userId: session.id,
      action: 'COMMENT_CREATE',
      entity: 'ApplicationComment',
      entityId: comment.id,
      newValue: {
        applicationId: id,
        mentionedCount: data.mentionedIds?.length || 0,
      },
    })

    return NextResponse.json(
      {
        success: true,
        comment: {
          ...comment,
          mentionedIds: mentionedIds ? mentionedIds.split(',') : [],
        },
      },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 },
      )
    }
    console.error('[comment-create]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
