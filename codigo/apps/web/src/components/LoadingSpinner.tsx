export function LoadingSpinner() {
  return (
    <div className="space-y-4 animate-fade-in" aria-busy="true" aria-label="Carregando">
      {/* Linha de header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="skeleton w-9 h-9 rounded-lg" />
        <div className="space-y-1.5">
          <div className="skeleton h-5 w-36 rounded" />
          <div className="skeleton h-3.5 w-24 rounded" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="skeleton w-9 h-9 rounded-lg" />
              <div className="skeleton h-5 w-14 rounded-full" />
            </div>
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3.5 w-1/2 rounded" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden mt-4">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <div className="skeleton h-3.5 w-48 rounded" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4 border-b border-slate-50 last:border-0">
            <div className="skeleton w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3.5 w-40 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
