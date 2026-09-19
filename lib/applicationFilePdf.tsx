import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    direction: 'rtl',
  },
  header: {
    backgroundColor: '#0d7a3e',
    padding: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0d7a3e',
    borderBottomWidth: 2,
    borderBottomColor: '#0d7a3e',
    paddingBottom: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    width: '40%',
    color: '#6b7280',
    fontSize: 10,
  },
  value: {
    width: '60%',
    color: '#111827',
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  badge: {
    backgroundColor: '#f0faf4',
    padding: 8,
    marginTop: 8,
    fontSize: 11,
    textAlign: 'center',
    color: '#0d7a3e',
    fontWeight: 'bold',
  },
})

export type ApplicationFileData = {
  trackingNumber: string
  status: string
  stage: string
  submittedAt: string
  citizen: {
    fullName: string
    nationalId: string
    phone: string
    gov: string | null
    center: string | null
  }
  land: {
    gov: string | null
    center: string | null
    village: string | null
    detail: string | null
    totalFaddan: number
    authorityName: string | null
    lat: string | null
    lng: string | null
  } | null
  documents: Array<{ originalName: string; type: string; isVerified: boolean }>
  payments: Array<{ type: string; amount: number; receiptNumber: string | null }>
  stages: Array<{ toStage: string; action: string; notes: string | null; createdAt: string }>
}

const STAGE_LABELS: Record<string, string> = {
  SUBMITTED: 'تم التقديم',
  INITIAL_REVIEW: 'مراجعة أولية',
  DOCS_REVIEW: 'فحص المستندات',
  SURVEY: 'معاينة ميدانية',
  PRICING: 'تسعير',
  COMMITTEE: 'عرض على اللجنة',
  CONTRACT: 'تعاقد',
  COMPLETED: 'منجز',
  REJECTED: 'مرفوض',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  ON_HOLD: 'معلّق',
  COMPLETED: 'منجز',
  REJECTED: 'مرفوض',
}

const PAYMENT_LABELS: Record<string, string> = {
  inspection: 'رسوم الفحص',
  survey: 'رسوم المعاينة',
  pricing: 'رسوم التسعير',
  other: 'أخرى',
}

export function ApplicationFilePdf({ data }: { data: ApplicationFileData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>منصة إسناد للتنمية الزراعية</Text>
          <Text style={styles.headerSubtitle}>ملف طلب تقنين وضع يد</Text>
        </View>

        <View style={styles.badge}>
          <Text>رقم التتبع: {data.trackingNumber}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>بيانات الطلب</Text>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ التقديم</Text>
            <Text style={styles.value}>{data.submittedAt}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>المرحلة الحالية</Text>
            <Text style={styles.value}>{STAGE_LABELS[data.stage] || data.stage}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>حالة الطلب</Text>
            <Text style={styles.value}>{STATUS_LABELS[data.status] || data.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>بيانات مقدم الطلب</Text>
          <View style={styles.row}>
            <Text style={styles.label}>الاسم</Text>
            <Text style={styles.value}>{data.citizen.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الرقم القومي</Text>
            <Text style={styles.value}>{data.citizen.nationalId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الهاتف</Text>
            <Text style={styles.value}>{data.citizen.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>المحافظة</Text>
            <Text style={styles.value}>{data.citizen.gov || '—'}</Text>
          </View>
        </View>

        {data.land && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>بيانات الأرض</Text>
            <View style={styles.row}>
              <Text style={styles.label}>المحافظة</Text>
              <Text style={styles.value}>{data.land.gov || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>المركز</Text>
              <Text style={styles.value}>{data.land.center || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>القرية</Text>
              <Text style={styles.value}>{data.land.village || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>جهة الولاية</Text>
              <Text style={styles.value}>{data.land.authorityName || '—'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>المساحة</Text>
              <Text style={styles.value}>{data.land.totalFaddan.toFixed(4)} فدان</Text>
            </View>
          </View>
        )}

        {data.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الرسوم المسددة</Text>
            {data.payments.map((p, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{PAYMENT_LABELS[p.type] || p.type}</Text>
                <Text style={styles.value}>
                  {p.amount.toLocaleString('en-US')} ج.م
                  {p.receiptNumber ? ` — إيصال ${p.receiptNumber}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {data.documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المستندات المرفوعة ({data.documents.length})</Text>
            {data.documents.slice(0, 10).map((d, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{d.originalName}</Text>
                <Text style={styles.value}>{d.isVerified ? 'معتمد' : 'قيد المراجعة'}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سجل المراحل</Text>
          {data.stages.map((s, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{new Date(s.createdAt).toLocaleDateString('ar-EG')}</Text>
              <Text style={styles.value}>{STAGE_LABELS[s.toStage] || s.toStage}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          منصة إسناد للتنمية الزراعية | تم إنشاء هذا الملف إلكترونيًا
        </Text>
      </Page>
    </Document>
  )
}
