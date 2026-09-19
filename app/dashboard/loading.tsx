import { SkeletonBox } from '@/components/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f7faf7] p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[24px] bg-white border border-black/5 p-5">
          <SkeletonBox className="h-6 w-48 mb-3" />
          <SkeletonBox className="h-4 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[20px] bg-white border border-black/5 p-5">
              <SkeletonBox className="h-4 w-24 mb-3" />
              <SkeletonBox className="h-8 w-16" />
            </div>
          ))}
        </div>

        <div className="rounded-[24px] bg-white border border-black/5 p-5">
          <SkeletonBox className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-black/5 p-4 flex items-center justify-between">
                <div className="flex-1">
                  <SkeletonBox className="h-4 w-40 mb-2" />
                  <SkeletonBox className="h-3 w-64" />
                </div>
                <SkeletonBox className="h-8 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
