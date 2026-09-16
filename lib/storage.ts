import 'server-only'
import { put, del } from '@vercel/blob'
import { nanoid } from 'nanoid'

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

// ملاحظة: Vercel Hobby حد أقصى 4MB لرفع الملفات من السيرفر
export const MAX_FILE_SIZE = 4 * 1024 * 1024

export const DOCUMENT_TYPES = {
  nationalId: 'بطاقة الرقم القومي',
  tawkeel: 'التوكيل',
  handProof: 'إثبات وضع اليد',
  landPhotos: 'صور الأرض',
  croquis: 'كروكي مساحي',
  receipts: 'إيصالات',
  other: 'مستندات أخرى',
} as const

export type DocumentType = keyof typeof DOCUMENT_TYPES

export function isValidDocumentType(type: string): type is DocumentType {
  return type in DOCUMENT_TYPES
}

export function isValidMime(mime: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime)
}

export function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin'
  return `${nanoid(20)}.${ext}`
}

/**
 * رفع ملف إلى Vercel Blob
 * @returns URL العام للملف (يُخزّن في Document.storagePath)
 */
export async function saveFile(params: {
  applicationId: string
  fileName: string
  buffer: Buffer
}): Promise<string> {
  const path = `applications/${params.applicationId}/${params.fileName}`
  const blob = await put(path, params.buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
  })
  return blob.url
}

/**
 * حذف ملف من Vercel Blob
 */
export async function deleteFile(blobUrl: string): Promise<void> {
  try {
    await del(blobUrl, { token: process.env.BLOB_READ_WRITE_TOKEN })
  } catch (err) {
    console.error('[storage] delete failed:', err)
  }
}

/**
 * قراءة ملف من Vercel Blob (للاستخدام في API الـ proxy)
 */
export async function readStoredFile(blobUrl: string): Promise<Buffer> {
  const res = await fetch(blobUrl)
  if (!res.ok) {
    throw new Error(`Failed to fetch blob: ${res.status}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
