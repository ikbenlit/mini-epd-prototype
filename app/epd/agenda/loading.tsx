export default function AgendaLoading() {
  return (
    <div className="p-6 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-slate-100 rounded animate-pulse" />
          <div className="h-10 w-24 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Calendar skeleton */}
      <div className="h-[600px] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-slate-400">Agenda laden...</span>
      </div>
    </div>
  );
}
