import { AlertCircle, RefreshCw } from 'lucide-react';

export function SkeletonBlock({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-neutral-200/80 ${className}`} />;
}

export function DashboardSkeleton({ cards = 4 }) {
  return (
    <div role="status" aria-label="Loading dashboard" className="mx-auto w-full max-w-7xl space-y-8">
      <span className="sr-only">Loading dashboard data…</span>
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-56 max-w-full" />
        <SkeletonBlock className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <SkeletonBlock className="h-11 w-11 rounded-xl" />
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
          <SkeletonBlock className="h-6 w-48" />
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 border-t border-neutral-100 pt-4">
              <SkeletonBlock className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-3 w-1/3" />
              </div>
              <SkeletonBlock className="h-7 w-20" />
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <SkeletonBlock className="h-6 w-36" />
          <SkeletonBlock className="h-24 w-full rounded-xl" />
          <SkeletonBlock className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function PageLoading({ label = 'Loading page' }) {
  return (
    <main role="status" aria-label={label} className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-8 text-center shadow-lg shadow-primary/5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle">
          <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
        </div>
        <p className="mt-5 text-sm font-semibold text-text-primary">{label}…</p>
        <p className="mt-1 text-sm text-text-secondary">Please wait while Serviqo prepares your content.</p>
        <span className="sr-only">Loading</span>
      </div>
    </main>
  );
}

export function PageDataSkeleton({ label = 'Loading page data', rows = 4 }) {
  return (
    <div role="status" aria-label={label} className="mx-auto w-full max-w-7xl space-y-6 py-2">
      <span className="sr-only">{label}…</span>
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-96 max-w-full" />
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <SkeletonBlock className="mb-6 h-10 w-full max-w-sm rounded-xl" />
        <div className="space-y-4">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="flex items-center gap-4 border-t border-neutral-100 pt-4">
              <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-2/3 max-w-64" />
                <SkeletonBlock className="h-3 w-1/2 max-w-48" />
              </div>
              <SkeletonBlock className="hidden h-8 w-24 shrink-0 sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InlineLoadError({ message, onRetry, className = '' }) {
  return (
    <div role="alert" className={`rounded-2xl border border-red-200 bg-red-50 p-5 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="font-bold text-red-900">We couldn&apos;t load the latest information</p>
            <p className="mt-1 text-sm leading-6 text-red-800">{message}</p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-bold text-red-800 transition-colors hover:bg-red-100 sm:self-center"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
