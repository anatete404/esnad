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
  'settings.manage': 'إدارة الإعدادات',
  'audit.view': 'مراجعة سجلات التدقيق',
  'payments.view': 'عرض الرسوم',
  'payments.create': 'إضافة دفعة',
  'payments.edit': 'تعديل دفعة',
  'payments.delete': 'حذف دفعة',
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
      'reports.view', 'reports.export',
      'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
    ] as Permission[],
  },
  supervisor: {
    nameAr: 'مشرف',
    permissions: [
      'applications.view', 'applications.edit', 'applications.assign',
      'applications.transfer', 'documents.verify', 'surveys.schedule',
      'reports.view',
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
  if (mode === 'BRANCH' && user.branchId) {
    return { branchId: user.branchId }
  }
  if (mode === 'OWN') {
    return { assignedToId: user.id }
  }
  return {}
}
