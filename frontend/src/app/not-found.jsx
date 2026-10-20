import Link from 'next/link';
import { ArrowLeft, Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <section className="relative w-full max-w-xl rounded-3xl border border-border bg-white p-7 text-center shadow-xl shadow-primary/5 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-6xl font-black tracking-tight text-primary sm:text-7xl">404</p>
        <h1 className="mt-3 text-2xl font-black text-text-primary sm:text-3xl">We can&apos;t find that page</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-secondary">
          The link may be outdated, or the page may have moved. Let&apos;s get you back to the services and people you need.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover">
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-bold text-text-primary transition-colors hover:bg-primary-subtle">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
