import { describe, it, expect } from 'vitest'
import { can, scopeWhere, ROLES, PERMISSIONS } from '@/lib/rbac'
import type { SessionUser, RoleKey } from '@/lib/rbac'

function makeUser(roleKey: RoleKey): SessionUser {
  return {
    id: 'test-user',
    email: 'test@test.com',
    fullName: 'Test User',
    roleKey,
    branchId: 'branch-1',
    permissions: [...ROLES[roleKey].permissions],
  }
}

describe('can', () => {
  it('returns false for null user', () => {
    expect(can(null, 'applications.view')).toBe(false)
  })

  it('admin has all permissions', () => {
    const admin = makeUser('admin')
    expect(can(admin, 'applications.view')).toBe(true)
    expect(can(admin, 'users.manage')).toBe(true)
    expect(can(admin, 'payments.delete')).toBe(true)
  })

  it('receptionist can create applications', () => {
    const user = makeUser('receptionist')
    expect(can(user, 'applications.view')).toBe(true)
    expect(can(user, 'applications.create')).toBe(true)
    expect(can(user, 'applications.approve')).toBe(false)
  })

  it('surveyor can submit surveys only', () => {
    const user = makeUser('surveyor')
    expect(can(user, 'surveys.submit')).toBe(true)
    expect(can(user, 'applications.approve')).toBe(false)
    expect(can(user, 'users.manage')).toBe(false)
  })

  it('authority_viewer can only view', () => {
    const user = makeUser('authority_viewer')
    expect(can(user, 'applications.view')).toBe(true)
    expect(can(user, 'reports.view')).toBe(true)
    expect(can(user, 'applications.edit')).toBe(false)
  })
})

describe('scopeWhere', () => {
  it('admin sees everything', () => {
    const admin = makeUser('admin')
    expect(scopeWhere(admin, 'BRANCH')).toEqual({})
  })

  it('authority_viewer sees everything', () => {
    const user = makeUser('authority_viewer')
    expect(scopeWhere(user, 'BRANCH')).toEqual({})
  })

  it('branch user sees only their branch', () => {
    const user = makeUser('branch_manager')
    expect(scopeWhere(user, 'BRANCH')).toEqual({ branchId: 'branch-1' })
  })

  it('OWN mode scopes by assignedToId', () => {
    const user = makeUser('reviewer')
    expect(scopeWhere(user, 'OWN')).toEqual({ assignedToId: 'test-user' })
  })
})

describe('ROLES and PERMISSIONS integrity', () => {
  it('every role has a nameAr', () => {
    for (const role of Object.values(ROLES)) {
      expect(role.nameAr).toBeTruthy()
      expect(typeof role.nameAr).toBe('string')
    }
  })

  it('every role permission exists in PERMISSIONS', () => {
    const validPerms = Object.keys(PERMISSIONS)
    for (const role of Object.values(ROLES)) {
      for (const p of role.permissions) {
        expect(validPerms).toContain(p)
      }
    }
  })

  it('admin has all PERMISSIONS', () => {
    expect(ROLES.admin.permissions.length).toBe(Object.keys(PERMISSIONS).length)
  })
})
