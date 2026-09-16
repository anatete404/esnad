import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { ROLES } from '../lib/rbac'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء الزراعة...')

  const cairo = await prisma.branch.upsert({
    where: { name: 'فرع القاهرة' },
    update: {},
    create: { name: 'فرع القاهرة', city: 'القاهرة' },
  })

  const minia = await prisma.branch.upsert({
    where: { name: 'فرع المنيا' },
    update: {},
    create: { name: 'فرع المنيا', city: 'المنيا' },
  })
  console.log('✅ الفروع تمت')

  for (const [key, role] of Object.entries(ROLES)) {
    await prisma.role.upsert({
      where: { key },
      update: {
        nameAr: role.nameAr,
        permissions: JSON.stringify(role.permissions),
      },
      create: {
        key,
        nameAr: role.nameAr,
        permissions: JSON.stringify(role.permissions),
      },
    })
  }
  console.log('✅ الأدوار تمت')

  const adminRole = await prisma.role.findUnique({ where: { key: 'admin' } })
  const adminPass = await bcrypt.hash('Admin@123456', 12)

  await prisma.user.upsert({
    where: { email: 'admin@hassan-land.com' },
    update: {},
    create: {
      email: 'admin@hassan-land.com',
      passwordHash: adminPass,
      fullName: 'مدير النظام',
      phone: '01113999179',
      roleId: adminRole!.id,
      branchId: cairo.id,
    },
  })

  const testAccounts = [
    { email: 'manager@hassan-land.com', role: 'branch_manager', name: 'مدير فرع تجريبي', branch: minia.id },
    { email: 'reception@hassan-land.com', role: 'receptionist', name: 'موظف استقبال', branch: cairo.id },
    { email: 'reviewer@hassan-land.com', role: 'reviewer', name: 'فاحص', branch: cairo.id },
    { email: 'surveyor@hassan-land.com', role: 'surveyor', name: 'مساح', branch: cairo.id },
    { email: 'legal@hassan-land.com', role: 'legal', name: 'مراجع قانوني', branch: cairo.id },
    { email: 'viewer@hassan-land.com', role: 'authority_viewer', name: 'ممثل الجهة', branch: null },
  ]

  const testPass = await bcrypt.hash('Test@123456', 12)

  for (const acc of testAccounts) {
    const role = await prisma.role.findUnique({ where: { key: acc.role } })
    if (!role) continue
    await prisma.user.upsert({
      where: { email: acc.email },
      update: {},
      create: {
        email: acc.email,
        passwordHash: testPass,
        fullName: acc.name,
        roleId: role.id,
        branchId: acc.branch ?? null,
      },
    })
  }
  console.log('✅ الحسابات التجريبية تمت')

  console.log('')
  console.log('🎉 خلصت الزراعة بنجاح!')
  console.log('')
  console.log('📋 بيانات الدخول:')
  console.log('  Admin:        admin@hassan-land.com    / Admin@123456')
  console.log('  Branch Mgr:   manager@hassan-land.com  / Test@123456')
  console.log('  Receptionist: reception@hassan-land.com/ Test@123456')
  console.log('  Reviewer:     reviewer@hassan-land.com / Test@123456')
  console.log('  Surveyor:     surveyor@hassan-land.com / Test@123456')
  console.log('  Legal:        legal@hassan-land.com    / Test@123456')
  console.log('  Viewer:       viewer@hassan-land.com   / Test@123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
