import { SkeletonBox } from '@/components/Skeleton'

export default function AppealsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonBox className="h-7 w-32 mb-2" />
      <SkeletonBox className="h-4 w-72" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[16px] bg-white border border-black/5 p-4">
            <SkeletonBox className="h-3 w-20 mb-2" />
            <SkeletonBox className="h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border-b border-black/5 flex items-center gap-4">
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-4 w-40" />
            <SkeletonBox className="h-4 w-64" />
            <SkeletonBox className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
