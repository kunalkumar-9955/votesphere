import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-white/5", className)} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="w-12 h-4 rounded" />
      </div>
      <Skeleton className="w-20 h-7 rounded" />
      <Skeleton className="w-24 h-3 rounded" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/3">
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Skeleton key={i} className={`h-4 rounded flex-1 ${i === 0 ? "max-w-[160px]" : "max-w-[100px]"}`} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="flex items-end gap-2 h-full px-4 pb-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 bg-white/5 rounded-t-lg"
            style={{ height: `${20 + Math.random() * 70}%` }} />
        ))}
      </div>
    </div>
  );
}
