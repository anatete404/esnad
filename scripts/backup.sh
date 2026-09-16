#!/bin/bash
# سكريبت النسخ الاحتياطي اليومي
# الاستخدام: bash scripts/backup.sh

set -e

BACKUP_DIR="./backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_NAME="backup_$DATE"

mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

echo "📦 بدء النسخ الاحتياطي: $BACKUP_NAME"

# 1) نسخ قاعدة البيانات
if [ -f "./prisma/dev.db" ]; then
  cp "./prisma/dev.db" "$BACKUP_DIR/$BACKUP_NAME/database.db"
  echo "✅ تم نسخ قاعدة البيانات"
else
  echo "⚠️  لم يتم العثور على قاعدة البيانات"
fi

# 2) نسخ مجلد المستندات
if [ -d "./storage" ]; then
  cp -r "./storage" "$BACKUP_DIR/$BACKUP_NAME/storage"
  echo "✅ تم نسخ المستندات"
else
  echo "⚠️  لم يتم العثور على مجلد المستندات"
fi

# 3) ضغط النسخة
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"
cd ..

# 4) حذف النسخ الأقدم من 30 يوم
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +30 -delete

echo "✅ اكتمل النسخ الاحتياطي: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
