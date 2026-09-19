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
    padding: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 11,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d7a3e',
    borderBottomWidth: 2,
    borderBottomColor: '#0d7a3e',
    paddingBottom: 5,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingRight: 12,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: '#0d7a3e',
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#4b5563',
    lineHeight: 1.6,
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
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
  },
  infoBox: {
    backgroundColor: '#f0faf4',
    padding: 12,
    borderRightWidth: 4,
    borderRightColor: '#0d7a3e',
    marginTop: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 10,
    color: '#0d5a2e',
    lineHeight: 1.6,
  },
})

export function UserGuidePdf() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>منصة إسناد للتنمية الزراعية</Text>
          <Text style={styles.headerSubtitle}>دليل المستخدم - تقنين أوضاع الأراضي</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مرحباً بك</Text>
          <Text style={styles.stepText}>
            هذه المنصة الإلكترونية تمكّنك من تقديم طلب تقنين وضع اليد على الأراضي، ورفع المستندات، ومتابعة حالة الطلب خطوة بخطوة حتى التعاقد النهائي. المنصة متاحة على مدار الساعة من أي جهاز متصل بالإنترنت.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخطوة 1: إنشاء الحساب</Text>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>افتح الموقع من المتصفح، ثم اضغط زر "حساب جديد" من القائمة العلوية.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>أدخل بياناتك: الاسم الرباعي، الرقم القومي (14 رقم)، رقم الهاتف، كلمة السر، والمحافظة.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>اضغط "إنشاء الحساب". سيتم تحويلك مباشرة إلى لوحة "ملفاتي".</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخطوة 2: تقديم طلب تقنين</Text>
          <Text style={styles.stepText}>
            الاستمارة مكوّنة من 4 خطوات. تنقّل بينها بحرية قبل الإرسال.
          </Text>

          <Text style={styles.stepTitle}>الخطوة 2.1 - بيانات الأرض</Text>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>المحافظة، المركز، القرية، ووصف تفصيلي للموقع.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>المساحة: أدخل فدان، قيراط، وسهم. الحاسبة تعرض الإجمالي تلقائياً.</Text>
          </View>

          <Text style={styles.stepTitle}>الخطوة 2.2 - تفاصيل إضافية</Text>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>تاريخ وضع اليد وسببه (استصلاح، ميراث، شراء عرفي...).</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>النشاط الحالي، مصدر المياه، وحالة الأرض.</Text>
          </View>

          <Text style={styles.stepTitle}>الخطوة 2.3 - رفع المستندات</Text>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>بطاقة الرقم القومي، التوكيل (إن وجد)، إثبات وضع اليد، صور الأرض.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>الصيغ المدعومة: JPG, PNG, WEBP, PDF بحد أقصى 4 ميجا للملف.</Text>
          </View>
        </View>

        <Text style={styles.footer}>منصة إسناد للتنمية الزراعية | جميع الحقوق محفوظة</Text>
        <Text style={styles.pageNumber}>صفحة 1 من 2</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>منصة إسناد للتنمية الزراعية</Text>
          <Text style={styles.headerSubtitle}>دليل المستخدم - صفحة 2</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخطوة 3: متابعة الطلب</Text>
          <Text style={styles.stepText}>يمكنك متابعة طلبك بطريقتين:</Text>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>برقم التتبع (EGY-TQN-XXXX): من صفحة "متابعة طلب" دون الحاجة لتسجيل الدخول.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>من لوحة "ملفاتي" بعد تسجيل الدخول بالرقم القومي وكلمة السر.</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 كل طلب يحصل على رمز QR خاص. يمكنك مسحه بكاميرا الهاتف للوصول السريع لصفحة التتبع.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخطوة 4: التظلمات</Text>
          <Text style={styles.stepText}>في حال رفض الطلب، يحق لك تقديم تظلم:</Text>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>افتح تفاصيل الطلب من "ملفاتي".</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>اضغط زر "تقديم تظلم" واكتب السبب (10 أحرف على الأقل).</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>سيتم مراجعة التظلم من موظف مختص، وفي حال القبول يُعاد الطلب لمرحلة المراجعة.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخطوة 5: التعاقد</Text>
          <Text style={styles.stepText}>بعد اعتماد الطلب:</Text>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>يتم إنشاء العقد من قبل الموظف المختص.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>يمكنك تحميل نسخة PDF من العقد من تفاصيل الطلب.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>بعد التوقيع، تتحول حالة الطلب تلقائياً إلى "منجز".</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الخطوة 6: الدعم والتواصل</Text>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>واتساب: متاح في جميع الصفحات عبر الزر العائم.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>صفحة "تواصل معنا" لكتابة استفسار مفصّل.</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>هاتف: 01113999179</Text>
          </View>
          <View style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>البريد الإلكتروني: Elhassan22003@gmail.com</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ⚠️ تنبيه: القرار النهائي على الطلب يصدر من الجهة المختصة فقط. المنصة وسيلة للتقديم والمتابعة ولا تُعد وعداً بالموافقة.
          </Text>
        </View>

        <Text style={styles.footer}>منصة إسناد للتنمية الزراعية | سجل تجاري 157574 | جميع الحقوق محفوظة</Text>
        <Text style={styles.pageNumber}>صفحة 2 من 2</Text>
      </Page>
    </Document>
  )
}
