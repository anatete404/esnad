import { SkeletonBox } from '@/components/Skeleton'

export default function TrackLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="rounded-[24px] bg-white border border-black/5 p-6 md:p-8">
        <SkeletonBox className="h-14 w-14 rounded-full mb-4" />
        <SkeletonBox className="h-6 w-48 mb-3" />
        <SkeletonBox className="h-4 w-full mb-2" />
        <SkeletonBox className="h-4 w-3/4 mb-6" />
        <SkeletonBox className="h-12 w-full rounded-full" />
      </div>
    </div>
  )
}
