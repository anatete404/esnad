# دليل النسخ الاحتياطي والاسترجاع

## 📦 النسخ الاحتياطي التلقائي (GitHub Actions)

### كيف يعمل؟
- GitHub Actions يشغّل سكريبت نسخ احتياطي **كل يوم الساعة 3 صباحاً UTC** (5 صباحاً بتوقيت القاهرة)
- النسخ محفوظة في **GitHub Artifacts** لمدة **30 يوم**
- يمكن تشغيلها يدوياً من GitHub → Actions → "Daily Database Backup" → "Run workflow"

### كيف تشاهد النسخ؟
1. افتح https://github.com/anatete404/esnad/actions
2. اضغط على "Daily Database Backup"
3. اختر أي run ناجح
4. ستجد الـ Artifact تحت اسم "database-backup-XXX"

### كيف تحمّل نسخة؟
1. افتح الـ Run المطلوب
2. اضغط على الـ Artifact
3. ينزل ملف zip يحتوي على `db_backup_YYYY-MM-DD_HH-MM-SS.sql`

---

## 🔄 استرجاع نسخة احتياطية

### المتطلبات
- PostgreSQL client مثبت على جهازك
- الاتصال بـ Neon (DATABASE_URL)
- ملف النسخة الاحتياطية (.sql)

### الخطوات

#### 1) فك ضغط الـ Artifact
```bash
unzip database-backup-XXX.zip
# سيظهر: db_backup_YYYY-MM-DD_HH-MM-SS.sql
```

#### 2) خذ نسخة احتياطية للحالة الحالية
⚠️ **مهم جداً قبل الاسترجاع:**
```bash
pg_dump "YOUR_DATABASE_URL" --no-owner -f current-state-backup.sql
```

#### 3) استرجع النسخة
```bash
psql "YOUR_DATABASE_URL" -f db_backup_YYYY-MM-DD_HH-MM-SS.sql
```

#### 4) تحقق من البيانات
```bash
psql "YOUR_DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\";"
psql "YOUR_DATABASE_URL" -c "SELECT COUNT(*) FROM \"Application\";"
```

---

## 🛡️ النسخ الاحتياطية الاحتياطية (Manual)

### نسخة يدوية من Neon
1. افتح https://console.neon.tech
2. اختر المشروع
3. Branches → production → **"Create Branch"** (نسخة كاملة مع البيانات)
4. احفظ اسم الـ Branch

### نسخة يدوية من Vercel Blob
- Vercel → Storage → hassan-blob → Browse Data → تصفح الملفات
- يمكن تحميلها يدوياً

---

## ⚠️ نصائح مهمة

- **لا تحذف** نسخة GitHub Actions قبل التأكد من نسخة أحدث
- **جرب الاسترجاع** على بيئة تجريبية مرة كل شهر
- **راقب** نسخة Neon PITR (متاح 7 أيام في Free tier)
- **وثّق** كل عملية استرجاع في سجل الشركة

---

## 📞 للطوارئ

1. **أول إجراء:** Rollback Vercel
   ```bash
   vercel rollback
   ```
2. **ثم:** استرجع الداتابيز من Neon Branch أو من GitHub Artifact
3. **أخيراً:** افحص سبب المشكلة ووثّقها

---

**آخر تحديث:** 2026-09-17
