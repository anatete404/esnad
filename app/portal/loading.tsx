import { SkeletonBox } from '@/components/Skeleton'

export default function PortalLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-[20px] bg-gradient-to-l from-[#0d7a3e]/40 to-[#0a5c2f]/40 p-6">
        <SkeletonBox className="h-4 w-24 bg-white/30 mb-3" />
        <SkeletonBox className="h-7 w-64 bg-white/30 mb-2" />
        <SkeletonBox className="h-4 w-40 bg-white/30" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[18px] bg-white border border-black/5 p-4">
            <SkeletonBox className="h-10 w-10 rounded-[12px] mb-3" />
            <SkeletonBox className="h-7 w-16 mb-2" />
            <SkeletonBox className="h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
        <div className="rounded-[20px] bg-white border border-black/5 p-5">
          <SkeletonBox className="h-5 w-32 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl p-3">
                <SkeletonBox className="h-3 w-28 mb-2" />
                <SkeletonBox className="h-4 w-40 mb-1" />
                <SkeletonBox className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[20px] bg-white border border-black/5 p-5">
          <SkeletonBox className="h-5 w-28 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-3">
              <SkeletonBox className="h-3 w-24 mb-2" />
              <SkeletonBox className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
