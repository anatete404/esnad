import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCitizenSession } from '@/lib/auth'
import {
  saveFile,
  generateFileName,
  isValidDocumentType,
  isValidMime,
  MAX_FILE_SIZE,
  DOCUMENT_TYPES,
} from '@/lib/storage'
import { logAudit } from '@/lib/audit'

// GET: عرض مستندات الطلب
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
    select: { id: true },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  const documents = await prisma.document.findMany({
    where: { applicationId: id },
    orderBy: { uploadedAt: 'desc' },
    select: {
      id: true,
      type: true,
      originalName: true,
      mimeType: true,
      size: true,
      isVerified: true,
      uploadedAt: true,
    },
  })

  return NextResponse.json({ documents })
}

// POST: رفع مستند جديد
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCitizenSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params

  const application = await prisma.application.findFirst({
    where: { id, citizenId: session.id },
    select: { id: true, status: true },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  if (application.status === 'COMPLETED' || application.status === 'REJECTED') {
    return NextResponse.json(
      { error: 'لا يمكن رفع مستندات على طلب مغلق' },
      { status: 400 }
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف' }, { status: 400 })
    }

    if (!type || !isValidDocumentType(type)) {
      return NextResponse.json({ error: 'نوع المستند غير صحيح' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `حجم الملف يتجاوز ${MAX_FILE_SIZE / 1024 / 1024} ميجا` },
        { status: 400 }
      )
    }

    if (!isValidMime(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم (JPG, PNG, WEBP, PDF فقط)' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = generateFileName(file.name)

    const storagePath = await saveFile({
      applicationId: id,
      fileName,
      buffer,
    })

    const document = await prisma.document.create({
      data: {
        applicationId: id,
        type,
        originalName: file.name,
        storagePath,
        mimeType: file.type,
        size: file.size,
      },
      select: {
        id: true,
        type: true,
        originalName: true,
        mimeType: true,
        size: true,
        uploadedAt: true,
      },
    })

    await logAudit({
      action: 'DOCUMENT_UPLOAD',
      entity: 'Document',
      entityId: document.id,
      newValue: {
        applicationId: id,
        type,
        originalName: file.name,
        size: file.size,
      },
    })

    return NextResponse.json({ success: true, document }, { status: 201 })
  } catch (err) {
    console.error('[document-upload]', err)
    return NextResponse.json({ error: 'خطأ في رفع الملف' }, { status: 500 })
  }
}
