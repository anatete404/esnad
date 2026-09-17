import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'إسناد | تقنين الأراضي',
  description: 'منصة متكاملة لتقديم ومتابعة طلبات تقنين أوضاع الأراضي',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cairo bg-[#f8faf7] text-[#111827] antialiased">
        {children}
      </body>
    </html>
  )
}
