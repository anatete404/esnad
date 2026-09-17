/**
 * ==========================================
 * Structured Logger
 * ==========================================
 * 
 * أداة logging منظمة بدون أي dependencies خارجية.
 * 
 * الفائدة:
 * - مخرجات JSON قابلة للتحليل في Vercel Logs
 * - مستويات: debug / info / warn / error
 * - Timestamp تلقائي
 * - يمكن استخدامه في أي مكان في الكود
 * 
 * ملاحظة: هذا الملف utility فقط. الكود الموجود حالياً
 * يستخدم console.log/error مباشرة، ولا يحتاج أي تعديل الآن.
 * يمكن استخدام logger في الكود الجديد أو عند تحسين الكود.
 * 
 * @example
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('Application created', { trackingNumber: 'EGY-...' })
 * logger.error('Payment failed', { paymentId: 'xxx', reason: 'insufficient funds' })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogMeta = Record<string, unknown>

function writeLog(level: LogLevel, message: string, meta?: LogMeta) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta && { meta }),
  }

  const output = JSON.stringify(entry)

  switch (level) {
    case 'error':
      console.error(output)
      break
    case 'warn':
      console.warn(output)
      break
    case 'debug':
      if (process.env.NODE_ENV !== 'production') {
        console.log(output)
      }
      break
    case 'info':
    default:
      console.log(output)
      break
  }
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => writeLog('debug', message, meta),
  info: (message: string, meta?: LogMeta) => writeLog('info', message, meta),
  warn: (message: string, meta?: LogMeta) => writeLog('warn', message, meta),
  error: (message: string, meta?: LogMeta) => writeLog('error', message, meta),
}
