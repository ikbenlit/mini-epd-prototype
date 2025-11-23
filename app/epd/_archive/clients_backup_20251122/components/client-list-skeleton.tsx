'use client'

export function ClientListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search Bar Skeleton */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      {/* Table Skeleton - Desktop */}
      <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-1/6 animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
                <div className="h-8 w-8 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Skeleton - Mobile */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <div className="h-3 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-pulse" />
              <div className="flex-1 h-10 bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-10 w-10 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
