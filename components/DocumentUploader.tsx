'use client'

import { useRef, useState } from 'react'
import { CloudUpload, FileText, Loader2, Trash2, CheckCircle2 } from 'lucide-react'

export type UploadedDoc = {
  id: string
  type: string
  originalName: string
  mimeType: string
  size: number
  isVerified?: boolean
}

type Props = {
  applicationId: string
  docType: string
  label: string
  hint?: string
  documents: UploadedDoc[]
  onChange: () => void
}

export default function DocumentUploader({
  applicationId,
  docType,
  label,
  hint,
  documents,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError('')
    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('type', docType)

        const res = await fetch(`/api/citizen/applications/${applicationId}/documents`, {
          method: 'POST',
          body: fd,
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'فشل الرفع')
          break
        }
      }
      onChange()
    } catch {
      setError('تعذّر الاتصال بالسيرفر')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المستند؟')) return
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) onChange()
    } catch {
      setError('فشل الحذف')
    }
  }

  return (
    <div className="rounded-[16px] border-2 border-dashed border-black/10 bg-white p-4 transition hover:border-[#0d7a3e]/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-bold flex items-center gap-1.5">
            <CloudUpload className="w-4 h-4 text-[#0d7a3e]" />
            {label}
          </div>
          {hint && (
            <div className="text-[10px] text-black/45 mt-1">
              {hint} • JPG, PNG, WEBP, PDF • حتى 10MB
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-black text-white disabled:opacity-50"
        >
          {uploading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> جارٍ
            </span>
          ) : (
            'اختيار ملف'
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <div className="mt-2 text-[11px] text-red-600 font-semibold">{error}</div>
      )}

      {documents.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-[10px] bg-[#f6f8f6] border border-black/5 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {doc.isVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0d7a3e] shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-black/40 shrink-0" />
                )}
                <a
                  href={`/api/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold truncate hover:underline"
                >
                  {doc.originalName}
                </a>
                <span className="text-[10px] text-black/40 shrink-0">
                  {(doc.size / 1024).toFixed(0)} KB
                </span>
              </div>
              {!doc.isVerified && (
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="text-red-500 hover:text-red-700 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
