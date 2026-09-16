import { nanoid } from 'nanoid'

export function generateTrackingNumber(): string {
  const year = new Date().getFullYear()
  const code = nanoid(6).toUpperCase().replace(/[-_]/g, 'X')
  return `EGY-TQN-${year}-${code}`
}

export function calcFaddan(faddan: number, qirat: number, sahm: number): number {
  return faddan + qirat / 24 + sahm / 576
}

export function formatNumber(n: number, digits = 2): string {
  return n.toLocaleString('ar-EG', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
