import { Skeleton } from "@/components/ui/skeleton"

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
      <Skeleton className="h-16 w-16 rounded-full shrink-0" />
      <div className="flex flex-col gap-2 w-full">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function ProfileFormSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-6 border-t border-border">
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  )
}

export function LinkedAccountsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-48 ml-1" />
      <div className="flex flex-wrap gap-4">
        <Skeleton className="flex-1 min-w-[300px] h-[88px] rounded-xl" />
        <Skeleton className="flex-1 min-w-[300px] h-[88px] rounded-xl" />
      </div>
    </div>
  )
}

export function SessionsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      {/* Current Session */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32 ml-1" />
        <Skeleton className="h-24 w-full rounded-xl border border-primary/10" />
      </div>
      
      {/* Other Sessions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32 ml-1" />
            <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}