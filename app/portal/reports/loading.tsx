import { SkeletonBox } from '@/components/Skeleton'

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonBox className="h-4 w-32" />
      <div className="flex justify-between gap-4">
        <div>
          <SkeletonBox className="h-7 w-48 mb-2" />
          <SkeletonBox className="h-3 w-64" />
        </div>
        <SkeletonBox className="h-10 w-40 rounded-full" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[18px] bg-white border border-black/5 p-4">
            <SkeletonBox className="h-10 w-10 rounded-[12px] mb-3" />
            <SkeletonBox className="h-7 w-20 mb-2" />
            <SkeletonBox className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-[20px] bg-white border border-black/5 p-5">
            <SkeletonBox className="h-5 w-40 mb-4" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="mb-3">
                <SkeletonBox className="h-3 w-full mb-1" />
                <SkeletonBox className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
