import 'server-only'
import { Resend } from 'resend'

let resendClient: Resend | null = null

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY missing — emails disabled')
    return null
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const APP_NAME = 'منصة إسناد للتنمية الزراعية'

type SendEmailParams = {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.log('[email] skipped (no API key):', params.subject)
    return false
  }

  try {
    const result = await resend.emails.send({
      from: `${APP_NAME} <${FROM}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    })

    if (result.error) {
      console.error('[email] send failed:', result.error)
      return false
    }

    console.log('[email] sent:', result.data?.id, '→', params.to)
    return true
  } catch (err) {
    console.error('[email] exception:', err)
    return false
  }
}

// ==========================================
// Templates
// ==========================================

function emailWrapper(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Tahoma', Arial, sans-serif; background: #f8faf7; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: #0d7a3e; color: #fff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; }
    .header p { margin: 4px 0 0; font-size: 12px; opacity: 0.9; }
    .body { padding: 28px 24px; color: #111; line-height: 1.8; font-size: 14px; }
    .box { background: #f0faf4; border-right: 4px solid #0d7a3e; padding: 14px 18px; border-radius: 8px; margin: 16px 0; }
    .box strong { color: #0d7a3e; }
    .footer { background: #0a0f0d; color: #fff; padding: 16px 24px; text-align: center; font-size: 11px; opacity: 0.7; }
    .btn { display: inline-block; background: #0d7a3e; color: #fff !important; padding: 12px 28px; border-radius: 99px; text-decoration: none; font-weight: bold; margin: 16px 0; }
    a { color: #0d7a3e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
      <p>نظام تقنين أوضاع الأراضي</p>
    </div>
    <div class="body">
      <h2 style="color: #0d7a3e; margin-top: 0;">${title}</h2>
      ${body}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${APP_NAME} — جميع الحقوق محفوظة
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function welcomeEmail(fullName: string): { subject: string; html: string } {
  return {
    subject: `مرحباً بك في ${APP_NAME}`,
    html: emailWrapper(
      `مرحباً ${fullName}`,
      `
        <p>تم إنشاء حسابك بنجاح في ${APP_NAME}.</p>
        <div class="box">
          يمكنك الآن تقديم طلبات تقنين أوضاع الأراضي ومتابعتها إلكترونياً.
        </div>
        <p>للدخول، استخدم الرقم القومي وكلمة السر.</p>
        <p style="text-align: center;">
          <a href="https://hassan-platform.vercel.app/login" class="btn">تسجيل الدخول</a>
        </p>
      `
    ),
  }
}

export function applicationReceivedEmail(params: {
  fullName: string
  trackingNumber: string
}): { subject: string; html: string } {
  return {
    subject: `تم استلام طلبك — ${params.trackingNumber}`,
    html: emailWrapper(
      'تم استلام طلبك بنجاح',
      `
        <p>عزيزي ${params.fullName}،</p>
        <p>تم استلام طلب تقنين وضع اليد الخاص بك بنجاح.</p>
        <div class="box">
          <strong>رقم التتبع:</strong>
          <div style="font-family: monospace; font-size: 18px; margin-top: 6px; direction: ltr;">${params.trackingNumber}</div>
        </div>
        <p>احتفظ برقم التتبع هذا لمتابعة حالة طلبك في أي وقت.</p>
        <p style="text-align: center;">
          <a href="https://hassan-platform.vercel.app/track/${params.trackingNumber}" class="btn">متابعة الطلب</a>
        </p>
      `
    ),
  }
}

export function stageChangedEmail(params: {
  fullName: string
  trackingNumber: string
  stage: string
}): { subject: string; html: string } {
  return {
    subject: `تحديث حالة طلبك — ${params.trackingNumber}`,
    html: emailWrapper(
      'تحديث حالة الطلب',
      `
        <p>عزيزي ${params.fullName}،</p>
        <p>تم تحديث حالة طلبك في ${APP_NAME}.</p>
        <div class="box">
          <strong>رقم التتبع:</strong> ${params.trackingNumber}<br>
          <strong>المرحلة الحالية:</strong> ${params.stage}
        </div>
        <p style="text-align: center;">
          <a href="https://hassan-platform.vercel.app/track/${params.trackingNumber}" class="btn">عرض التفاصيل</a>
        </p>
      `
    ),
  }
}

export function applicationRejectedEmail(params: {
  fullName: string
  trackingNumber: string
}): { subject: string; html: string } {
  return {
    subject: `تحديث مهم بشأن طلبك — ${params.trackingNumber}`,
    html: emailWrapper(
      'تم رفض الطلب',
      `
        <p>عزيزي ${params.fullName}،</p>
        <p>نأسف لإبلاغك بأنه تم رفض طلب التقنين رقم:</p>
        <div class="box" style="background: #fef2f2; border-right-color: #dc2626;">
          <strong style="color: #dc2626;">${params.trackingNumber}</strong>
        </div>
        <p>يمكنك التواصل مع خدمة العملاء لمعرفة تفاصيل القرار.</p>
      `
    ),
  }
}
