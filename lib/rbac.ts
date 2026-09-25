// ==========================================
// PERMISSIONS
// - permissions المستخدمة حالياً: مرتبطة بـ API routes مباشرة
// - permissions المستقبلية: معرّفة للاستخدام القادم (roadmap)
//   ولن تُستخدم حتى يتم تفعيل الميزة المقابلة
// ==========================================
// Reserved for future features (not yet wired to routes):
//   - applications.approve
//   - applications.reject
//   - documents.delete
//   - contracts.sign
//   - settings.manage
// ==========================================

export const PERMISSIONS = {
  'applications.view': 'عرض الطلبات',
  'applications.create': 'إنشاء طلب',
  'applications.edit': 'تعديل طلب',
  'applications.assign': 'إسناد طلب',
  'applications.approve': 'اعتماد طلب',
  'applications.reject': 'رفض طلب',
  'applications.transfer': 'نقل بين المراحل',
  'documents.upload': 'رفع مستندات',
  'documents.verify': 'اعتماد مستندات',
  'documents.delete': 'حذف مستندات',
  'surveys.schedule': 'جدولة معاينة',
  'surveys.submit': 'تسليم تقرير معاينة',
  'contracts.create': 'إنشاء عقد',
  'contracts.sign': 'توقيع عقد',
  'reports.view': 'عرض تقارير',
  'reports.export': 'تصدير تقارير',
  'users.manage': 'إدارة الموظفين',
  'users.manage.branch': 'إدارة موظفي الفرع',
  'settings.manage': 'إدارة الإعدادات',
  'audit.view': 'مراجعة سجلات التدقيق',
  'owner.dashboard': 'لوحة المالك',
  'payments.view': 'عرض الرسوم',
  'payments.create': 'إضافة دفعة',
  'payments.edit': 'تعديل دفعة',
  'payments.delete': 'حذف دفعة',
  'appeals.view': 'عرض التظلمات',
  'appeals.review': 'مراجعة التظلمات',
  'appeals.approve': 'قبول تظلم',
  'appeals.reject': 'رفض تظلم',
} as const

export type Permission = keyof typeof PERMISSIONS

export const ROLES = {
  admin: {
    nameAr: 'مدير النظام',
    permissions: Object.keys(PERMISSIONS) as Permission[],
  },
  branch_manager: {
    nameAr: 'مدير فرع',
    permissions: [
      'applications.view', 'applications.edit', 'applications.assign',
      'applications.approve', 'applications.reject', 'applications.transfer',
      'documents.verify', 'surveys.schedule', 'contracts.create',
      'owner.dashboard',
      'reports.view', 'reports.export',
      'users.manage.branch',
      'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
      'appeals.view', 'appeals.review', 'appeals.approve', 'appeals.reject',
      'audit.view',
    ] as Permission[],
  },
  supervisor: {
    nameAr: 'مشرف',
    permissions: [
      'applications.view', 'applications.edit', 'applications.assign',
      'applications.transfer', 'documents.verify', 'surveys.schedule',
      'reports.view',
      'appeals.view', 'appeals.review',
    ] as Permission[],
  },
  receptionist: {
    nameAr: 'موظف استقبال',
    permissions: [
      'applications.view', 'applications.create', 'applications.edit',
      'documents.upload',
      'payments.view', 'payments.create',
    ] as Permission[],
  },
  reviewer: {
    nameAr: 'فاحص',
    permissions: [
      'applications.view', 'applications.edit', 'applications.transfer',
      'documents.verify', 'documents.upload',
    ] as Permission[],
  },
  legal: {
    nameAr: 'مراجع قانوني',
    permissions: [
      'applications.view', 'applications.transfer', 'documents.verify',
      'contracts.create',
      'appeals.view', 'appeals.review', 'appeals.approve', 'appeals.reject',
    ] as Permission[],
  },
  surveyor: {
    nameAr: 'مساح',
    permissions: [
      'applications.view', 'surveys.submit', 'documents.upload',
    ] as Permission[],
  },
  accountant: {
    nameAr: 'محاسب',
    permissions: [
      'applications.view', 'contracts.create', 'reports.view',
      'reports.export',
      'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
    ] as Permission[],
  },
  data_entry: {
    nameAr: 'مدخل بيانات',
    permissions: [
      'applications.view', 'applications.create', 'applications.edit',
      'documents.upload',
    ] as Permission[],
  },
  authority_viewer: {
    nameAr: 'ممثل الجهة (اطلاع)',
    permissions: ['applications.view', 'reports.view'] as Permission[],
  },
} as const

export type RoleKey = keyof typeof ROLES

export type SessionUser = {
  id: string
  email: string
  fullName: string
  roleKey: RoleKey
  branchId: string | null
  permissions: Permission[]
}

export function can(user: SessionUser | null, permission: Permission): boolean {
  if (!user) return false
  return user.permissions.includes(permission)
}

export function scopeWhere(
  user: SessionUser,
  mode: 'ALL' | 'BRANCH' | 'OWN' = 'BRANCH'
): Record<string, unknown> {
  if (mode === 'ALL' || user.roleKey === 'admin' || user.roleKey === 'authority_viewer') {
    return {}
  }
  if (mode === 'BRANCH') {
    return user.branchId
      ? { branchId: user.branchId }
      : { branchId: '__no_access__' }
  }
  if (mode === 'OWN') {
    return { assignedToId: user.id }
  }
  return { branchId: '__no_access__' }
}
