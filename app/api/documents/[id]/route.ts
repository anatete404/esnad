import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCitizenSession, getUserSession } from '@/lib/auth'
import { readStoredFile, deleteFile } from '@/lib/storage'

// GET: تحميل/عرض ملف
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const citizen = await getCitizenSession()
  const staff = await getUserSession()

  if (!citizen && !staff) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      application: { select: { citizenId: true } },
    },
  })

  if (!document) {
    return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
  }

  // مواطن: لازم يكون صاحب الطلب
  if (citizen && !staff) {
    if (document.application.citizenId !== citizen.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }
  }

  try {
    const buffer = await readStoredFile(document.storagePath)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': document.mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(document.originalName)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[document-get]', err)
    return NextResponse.json({ error: 'الملف غير متاح' }, { status: 404 })
  }
}

// DELETE: حذف مستند (المواطن - فقط قبل المراجعة)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const citizen = await getCitizenSession()
  if (!citizen) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      application: { select: { citizenId: true, status: true } },
    },
  })

  if (!document) {
    return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 })
  }

  if (document.application.citizenId !== citizen.id) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  if (document.isVerified) {
    return NextResponse.json(
      { error: 'لا يمكن حذف مستند تم اعتماده' },
      { status: 400 }
    )
  }

  await deleteFile(document.storagePath)
  await prisma.document.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
