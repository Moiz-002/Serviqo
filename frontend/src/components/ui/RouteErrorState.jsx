'use client';

import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function RouteErrorState({ error, reset }) {
  return (
    <main className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div aria-hidden="true" className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <section className="relative w-full max-w-xl rounded-3xl border border-border bg-white p-7 text-center shadow-xl shadow-primary/5 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-text-accent">Serviqo</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-text-primary sm:text-3xl">That didn&apos;t go as planned</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
          Something went wrong while loading this page. Your account and saved information are unchanged. Please try again.
        </p>
        {error?.digest && <p className="mt-3 text-xs text-text-tertiary">Reference: {error.digest}</p>}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold text-text-primary transition-colors hover:bg-primary-subtle"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go to homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
