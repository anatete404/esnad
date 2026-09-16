import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCitizenSession, getUserSession } from '@/lib/auth'

// GET: قائمة إشعارات (مواطن أو موظف)
export async function GET() {
  const citizen = await getCitizenSession()
  const staff = await getUserSession()

  if (!citizen && !staff) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const where = citizen
    ? { citizenId: citizen.id }
    : { userId: staff!.id }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      body: true,
      isRead: true,
      createdAt: true,
      applicationId: true,
    },
  })

  const unreadCount = await prisma.notification.count({
    where: { ...where, isRead: false },
  })

  return NextResponse.json({ notifications, unreadCount })
}

// PATCH: تحديد إشعار كمقروء
export async function PATCH(req: Request) {
  const citizen = await getCitizenSession()
  const staff = await getUserSession()

  if (!citizen && !staff) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const notificationId = body.id
    const markAll = body.all === true

    const ownerFilter = citizen
      ? { citizenId: citizen.id }
      : { userId: staff!.id }

    if (markAll) {
      await prisma.notification.updateMany({
        where: { ...ownerFilter, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true })
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'معرّف مطلوب' }, { status: 400 })
    }

    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, ...ownerFilter },
    })

    if (!notification) {
      return NextResponse.json({ error: 'الإشعار غير موجود' }, { status: 404 })
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[notifications-patch]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
