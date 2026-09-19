import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f8faf7]">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}