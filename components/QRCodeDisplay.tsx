'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Download, QrCode } from 'lucide-react'

type Props = {
  value: string
  size?: number
  label?: string
  downloadFileName?: string
}

export default function QRCodeDisplay({
  value,
  size = 180,
  label = 'امسح لمتابعة الطلب',
  downloadFileName,
}: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: {
        dark: '#0d7a3e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [value, size])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = downloadFileName || `qr-${value}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (error) {
    return (
      <div className="rounded-[16px] bg-[#f9fbf9] border border-black/5 p-4 text-center">
        <QrCode className="w-8 h-8 mx-auto text-black/30" />
        <div className="mt-2 text-[11px] text-black/50">QR غير متاح</div>
      </div>
    )
  }

  return (
    <div className="rounded-[16px] bg-white border border-black/5 p-4 text-center">
      <div
        className="mx-auto bg-white p-2 rounded-lg"
        style={{ width: size, height: size }}
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code for ${value}`}
            width={size}
            height={size}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-black/5 rounded animate-pulse" />
        )}
      </div>
      <div className="mt-3 text-[11px] font-bold text-black/60">{label}</div>
      {dataUrl && (
        <button
          onClick={download}
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0d7a3e] hover:underline"
        >
          <Download className="w-3 h-3" />
          تحميل QR
        </button>
      )}
    </div>
  )
}
