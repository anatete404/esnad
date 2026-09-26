const VALID_GOV_CODES = new Set([
  '01', '02', '03', '04', '11', '12', '13', '14', '15', '16',
  '17', '18', '19', '21', '22', '23', '24', '25', '26', '27',
  '28', '29', '31', '32', '33', '34', '35', '88',
])

export function isValidEgyptianNationalId(id: string): boolean {
  if (!id || !/^\d{14}$/.test(id)) return false

  const centuryDigit = id[0]
  if (centuryDigit !== '2' && centuryDigit !== '3') return false

  const yearSuffix = parseInt(id.slice(1, 3), 10)
  const month = parseInt(id.slice(3, 5), 10)
  const day = parseInt(id.slice(5, 7), 10)
  const govCode = id.slice(7, 9)

  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false

  const fullYear = centuryDigit === '2' ? 1900 + yearSuffix : 2000 + yearSuffix

  const date = new Date(fullYear, month - 1, day)
  if (
    date.getFullYear() !== fullYear ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false
  }

  if (!VALID_GOV_CODES.has(govCode)) return false

  return true
}
