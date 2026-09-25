import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  fullName: z.string().min(3, 'الاسم قصير جداً').max(100),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح').max(20),
  email: z.string().email('البريد غير صحيح').optional().or(z.literal('')),
  trackingNumber: z.string().max(50).optional(),
  subject: z.string().min(5, 'الموضوع قصير جداً').max(200),
  message: z.string().min(20, 'الرسالة قصيرة جداً — 20 حرف على الأقل').max(2000),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const admins = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { key: 'admin' },
      },
      select: { id: true },
    })

    const adminUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, role: { select: { key: true } } },
    })

    const recipients = adminUsers.filter((u) =>
      ['admin', 'branch_manager'].includes(u.role.key)
    )

    await Promise.all(
      recipients.slice(0, 10).map((u) =>
        prisma.notification.create({
          data: {
            userId: u.id,
            title: `رسالة جديدة من ${data.fullName}`,
            body: `${data.subject}\n\n${data.message.slice(0, 200)}`,
          },
        })
      )
    )

    await logAudit({
      branchId: null,
      actorBranchId: null,
      action: 'CONTACT_FORM_SUBMIT',
      entity: 'Contact',
      newValue: {
        fullName: data.fullName,
        phone: data.phone,
        trackingNumber: data.trackingNumber,
        subject: data.subject,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'تم استلام رسالتك بنجاح. سيتم التواصل معك في أقرب وقت.',
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[contact]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
