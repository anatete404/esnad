import 'server-only'

import { SignJWT, jwtVerify } from 'jose'

export const TRACK_IDENTITY_COOKIE = 'hz_track_identity'
export const TRACK_IDENTITY_MAX_AGE = 15 * 60

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

// تطبيع رقم الهاتف إلى آخر 10 أرقام.
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10)
}

// إنشاء token قصير العمر لإثبات التحقق من هوية التتبع.
export async function createTrackIdentityToken(
  trackingNumber: string
): Promise<string> {
  return new SignJWT({ trackingNumber, type: 'track_identity' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

// التحقق من token وربطه برقم التتبع المطلوب.
export async function verifyTrackIdentityToken(
  token: string,
  trackingNumber: string
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return (
      payload.type === 'track_identity' &&
      payload.trackingNumber === trackingNumber
    )
  } catch {
    return false
  }
}
