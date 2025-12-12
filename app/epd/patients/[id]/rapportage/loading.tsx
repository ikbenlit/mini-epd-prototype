export default function RapportageLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-teal-100 rounded animate-pulse" />
      </div>

      {/* Timeline skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 w-4 bg-slate-200 rounded-full animate-pulse mt-1" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
