export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in-50 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted/70 rounded-xl animate-pulse" />
          <div className="h-4 w-72 bg-muted/40 rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted/60 rounded-xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted/60 rounded-md animate-pulse" />
              <div className="h-8 w-8 bg-muted/50 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-muted/80 rounded-lg animate-pulse" />
            <div className="h-3 w-32 bg-muted/40 rounded-md animate-pulse" />
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="h-5 w-36 bg-muted/70 rounded-md animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-full bg-muted/30 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
