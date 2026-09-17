import { describe, it, expect } from 'vitest'
import {
  getDefaultStatusNote,
  resolveStatusNote,
  DEFAULT_STATUS_NOTES,
} from '@/lib/statusNote'

describe('getDefaultStatusNote', () => {
  it('يعرض نص لكل مرحلة معروفة', () => {
    expect(getDefaultStatusNote('SUBMITTED')).toBe(DEFAULT_STATUS_NOTES.SUBMITTED)
    expect(getDefaultStatusNote('DOCS_REVIEW')).toBe(DEFAULT_STATUS_NOTES.DOCS_REVIEW)
    expect(getDefaultStatusNote('SURVEY')).toBe(DEFAULT_STATUS_NOTES.SURVEY)
  })

  it('يعرض نص افتراضي لمرحلة غير معروفة', () => {
    expect(getDefaultStatusNote('UNKNOWN_STAGE')).toBe('قيد المعالجة')
  })

  it('يعرض نص افتراضي لمرحلة فارغة', () => {
    expect(getDefaultStatusNote('')).toBe('قيد المعالجة')
  })
})

describe('resolveStatusNote', () => {
  it('يعرض النص اليدوي لو manual = true', () => {
    const result = resolveStatusNote('SURVEY', 'نص يدوي مخصص', true)
    expect(result).toBe('نص يدوي مخصص')
  })

  it('يعرض النص الافتراضي لو manual = false', () => {
    const result = resolveStatusNote('SURVEY', 'نص يدوي مخصص', false)
    expect(result).toBe(DEFAULT_STATUS_NOTES.SURVEY)
  })

  it('يعرض الافتراضي لو statusNote = null', () => {
    const result = resolveStatusNote('SURVEY', null, true)
    expect(result).toBe(DEFAULT_STATUS_NOTES.SURVEY)
  })

  it('يعرض الافتراضي لو statusNote = empty string', () => {
    const result = resolveStatusNote('SURVEY', '   ', true)
    expect(result).toBe(DEFAULT_STATUS_NOTES.SURVEY)
  })
})
