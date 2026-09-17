import { describe, it, expect } from 'vitest'
import { calcFaddan, generateTrackingNumber, formatNumber, formatDate } from '@/lib/utils'

describe('calcFaddan', () => {
  it('يحسب فدان فقط', () => {
    expect(calcFaddan(5, 0, 0)).toBe(5)
  })

  it('يحسب فدان + قيراط', () => {
    expect(calcFaddan(1, 12, 0)).toBe(1.5)
  })

  it('يحسب فدان + قيراط + سهم', () => {
    const result = calcFaddan(1, 12, 288)
    expect(result).toBeCloseTo(2, 4)
  })

  it('يتعامل مع صفر', () => {
    expect(calcFaddan(0, 0, 0)).toBe(0)
  })

  it('يحسب 24 قيراط = 1 فدان', () => {
    expect(calcFaddan(0, 24, 0)).toBe(1)
  })

  it('يحسب 576 سهم = 1 فدان', () => {
    expect(calcFaddan(0, 0, 576)).toBe(1)
  })
})

describe('generateTrackingNumber', () => {
  it('يبدأ بـ EGY-TQN', () => {
    const result = generateTrackingNumber()
    expect(result.startsWith('EGY-TQN-')).toBe(true)
  })

  it('يحتوي على السنة الحالية', () => {
    const year = new Date().getFullYear().toString()
    const result = generateTrackingNumber()
    expect(result).toContain(year)
  })

  it('ينتج أرقام مختلفة في كل مرة', () => {
    const a = generateTrackingNumber()
    const b = generateTrackingNumber()
    expect(a).not.toBe(b)
  })

  it('مطابق للنمط EGY-TQN-YYYY-XXXXXX', () => {
    const result = generateTrackingNumber()
    expect(result).toMatch(/^EGY-TQN-\d{4}-[A-Z0-9]+$/)
  })
})

describe('formatNumber', () => {
  it('يعرض رقم بشكل منسق', () => {
    const result = formatNumber(1234.5678, 2)
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})

describe('formatDate', () => {
  it('يعرض تاريخ بشكل منسق', () => {
    const result = formatDate(new Date('2026-01-15'))
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('يقبل string date', () => {
    const result = formatDate('2026-01-15')
    expect(result).toBeTruthy()
  })
})
