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
    fontSize: 20,
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
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0d7a3e',
    borderBottomWidth: 2,
    borderBottomColor: '#0d7a3e',
    paddingBottom: 4,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 6,
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
  note: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0faf4',
    borderLeftWidth: 4,
    borderLeftColor: '#0d7a3e',
    fontSize: 10,
    color: '#0a5c2f',
  },
})

type ContractData = {
  contractNo: string
  createdAt: string
  signedAt: string | null
  value: number
  paymentPlan: string | null
  citizen: {
    fullName: string
    nationalId: string
    phone: string
  }
  land: {
    gov: string | null
    center: string | null
    village: string | null
    detail: string | null
    totalFaddan: number
    authorityName: string | null
  } | null
  trackingNumber: string
}

export function ContractPdf({ data }: { data: ContractData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>منصة إسناد للتنمية الزراعية</Text>
          <Text style={styles.headerSubtitle}>عقد تقنين وضع يد</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>بيانات العقد</Text>
          <View style={styles.row}>
            <Text style={styles.label}>رقم العقد</Text>
            <Text style={styles.value}>{data.contractNo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>رقم الطلب</Text>
            <Text style={styles.value}>{data.trackingNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ إنشاء العقد</Text>
            <Text style={styles.value}>{data.createdAt}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ التوقيع</Text>
            <Text style={styles.value}>{data.signedAt || 'قيد الانتظار'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>بيانات الطرف الأول (المواطن)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>الاسم الكامل</Text>
            <Text style={styles.value}>{data.citizen.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>الرقم القومي</Text>
            <Text style={styles.value}>{data.citizen.nationalId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>رقم الهاتف</Text>
            <Text style={styles.value}>{data.citizen.phone}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>بيانات الأرض</Text>
          <View style={styles.row}>
            <Text style={styles.label}>المحافظة</Text>
            <Text style={styles.value}>{data.land?.gov || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>المركز</Text>
            <Text style={styles.value}>{data.land?.center || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>القرية / المنطقة</Text>
            <Text style={styles.value}>{data.land?.village || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>وصف الموقع</Text>
            <Text style={styles.value}>{data.land?.detail || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>جهة الولاية</Text>
            <Text style={styles.value}>{data.land?.authorityName || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>المساحة (فدان)</Text>
            <Text style={styles.value}>
              {data.land?.totalFaddan.toFixed(4) || '0'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>البيانات المالية</Text>
          <View style={styles.row}>
            <Text style={styles.label}>قيمة العقد</Text>
            <Text style={styles.value}>
              {data.value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              جنيه مصري
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>خطة الدفع</Text>
            <Text style={styles.value}>{data.paymentPlan || 'غير محددة'}</Text>
          </View>
        </View>

        <View style={styles.note}>
          <Text>
            ملاحظة: هذا العقد يُعدّ مبدئيًا لحين التوقيع الرسمي من الطرفين
            والجهة المختصة. جميع البيانات المذكورة مسؤولية مقدم الطلب.
          </Text>
        </View>

        <Text style={styles.footer}>
          منصة إسناد للتنمية الزراعية | تم إنشاء هذا المستند إلكترونيًا
        </Text>
      </Page>
    </Document>
  )
}
