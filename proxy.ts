import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

const CITIZEN_COOKIE = 'hz_citizen_session'
const USER_COOKIE = 'hz_user_session'

// مسارات عامة (متاحة بدون تسجيل دخول)
const PUBLIC_EXACT = [
  '/',
  '/login',
  '/register',
  '/track',
  '/portal/login',
  '/favicon.ico',
]

// مسارات عامة (بـ prefix)
const PUBLIC_PREFIXES = [
  '/track/',
  '/api/auth/',
  '/api/track/',
]

// مسارات محمية للمواطن
const CITIZEN_PREFIXES = ['/dashboard', '/apply']

// مسارات محمية للموظفين
const STAFF_PREFIXES = ['/portal']

async function verifyToken(
  token: string,
  expectedType: 'citizen' | 'user'
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.type === expectedType
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1) اسمح بالمسارات العامة بالضبط
  if (PUBLIC_EXACT.includes(pathname)) {
    return NextResponse.next()
  }

  // 2) اسمح بالمسارات العامة بـ prefix
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 3) تحقق من مسارات المواطن
  const isCitizenPath = CITIZEN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (isCitizenPath) {
    const token = request.cookies.get(CITIZEN_COOKIE)?.value
    const valid = token ? await verifyToken(token, 'citizen') : false
    if (!valid) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  // 4) تحقق من مسارات الموظفين
  const isStaffPath = STAFF_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )

  if (isStaffPath) {
    const token = request.cookies.get(USER_COOKIE)?.value
    const valid = token ? await verifyToken(token, 'user') : false
    if (!valid) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
