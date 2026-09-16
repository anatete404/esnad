#!/bin/bash
# سكريبت استعادة نسخة احتياطية
# الاستخدام: bash scripts/restore.sh backups/backup_2026-01-15_10-00-00.tar.gz

set -e

if [ -z "$1" ]; then
  echo "❌ الاستخدام: bash scripts/restore.sh <backup-file.tar.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ الملف غير موجود: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  تحذير: هذا الإجراء سيعيد كتابة قاعدة البيانات والمستندات الحالية"
read -p "هل أنت متأكد؟ اكتب 'yes' للمتابعة: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "تم الإلغاء"
  exit 0
fi

TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"
EXTRACTED=$(ls "$TEMP_DIR")

# استعادة قاعدة البيانات
if [ -f "$TEMP_DIR/$EXTRACTED/database.db" ]; then
  cp "$TEMP_DIR/$EXTRACTED/database.db" "./prisma/dev.db"
  echo "✅ تم استعادة قاعدة البيانات"
fi

# استعادة المستندات
if [ -d "$TEMP_DIR/$EXTRACTED/storage" ]; then
  rm -rf "./storage"
  cp -r "$TEMP_DIR/$EXTRACTED/storage" "./storage"
  echo "✅ تم استعادة المستندات"
fi

rm -rf "$TEMP_DIR"
echo "✅ اكتملت الاستعادة"
