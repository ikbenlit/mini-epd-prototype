export default function PatientLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-slate-200 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
