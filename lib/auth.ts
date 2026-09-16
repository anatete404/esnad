import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { ROLES, type RoleKey, type Permission, type SessionUser } from './rbac'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

const CITIZEN_COOKIE = 'hz_citizen_session'
const USER_COOKIE = 'hz_user_session'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function createCitizenToken(citizenId: string): Promise<string> {
  return new SignJWT({ sub: citizenId, type: 'citizen' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret)
}

export async function createUserToken(payload: {
  userId: string
  roleKey: RoleKey
  branchId: string | null
}): Promise<string> {
  return new SignJWT({ ...payload, type: 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function getCitizenSession(): Promise<{ id: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CITIZEN_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== 'citizen') return null
    return { id: payload.sub as string }
  } catch {
    return null
  }
}

export async function getUserSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(USER_COOKIE)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.type !== 'user') return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { role: true },
    })
    if (!user || !user.isActive) return null

    const roleKey = user.role.key as RoleKey
    const permissions = (ROLES[roleKey]?.permissions ?? []) as Permission[]

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleKey,
      branchId: user.branchId,
      permissions,
    }
  } catch {
    return null
  }
}

export async function clearCitizenCookie() {
  const cookieStore = await cookies()
  cookieStore.set(CITIZEN_COOKIE, '', { maxAge: 0, path: '/' })
}

export async function clearUserCookie() {
  const cookieStore = await cookies()
  cookieStore.set(USER_COOKIE, '', { maxAge: 0, path: '/' })
}

export const COOKIES = { CITIZEN_COOKIE, USER_COOKIE }
