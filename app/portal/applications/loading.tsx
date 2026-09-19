import { SkeletonBox } from '@/components/Skeleton'

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      <SkeletonBox className="h-4 w-40" />
      <div>
        <SkeletonBox className="h-7 w-32 mb-2" />
        <SkeletonBox className="h-3 w-64" />
      </div>

      <div className="rounded-[18px] bg-white border border-black/5 p-4 grid md:grid-cols-4 gap-3">
        <SkeletonBox className="h-11" />
        <SkeletonBox className="h-11" />
        <SkeletonBox className="h-11" />
        <SkeletonBox className="h-11" />
      </div>

      <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden">
        <div className="p-4 border-b border-black/5">
          <SkeletonBox className="h-4 w-32" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 border-b border-black/5 flex items-center gap-4">
            <SkeletonBox className="h-4 w-4" />
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-4 w-40" />
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-6 w-20 rounded-full" />
            <SkeletonBox className="h-6 w-16 rounded-full" />
            <SkeletonBox className="h-8 w-8 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
