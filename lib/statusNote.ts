export const DEFAULT_STATUS_NOTES: Record<string, string> = {
  SUBMITTED: 'تم استلام الطلب — قيد المراجعة الأولية',
  INITIAL_REVIEW: 'الطلب تحت المراجعة الأولية',
  DOCS_REVIEW: 'قيد فحص المستندات',
  SURVEY: 'بانتظار المعاينة الميدانية',
  PRICING: 'قيد التسعير',
  COMMITTEE: 'معروض على اللجنة المختصة',
  CONTRACT: 'جاهز للتعاقد',
  COMPLETED: 'تم إتمام التعاقد',
  REJECTED: 'تم رفض الطلب',
}

export function getDefaultStatusNote(stage: string): string {
  return DEFAULT_STATUS_NOTES[stage] || 'قيد المعالجة'
}

export function resolveStatusNote(
  stage: string,
  statusNote: string | null,
  statusNoteManual: boolean
): string {
  if (statusNoteManual && statusNote && statusNote.trim().length > 0) {
    return statusNote
  }
  return getDefaultStatusNote(stage)
}
