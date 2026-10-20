import Link from 'next/link';
import { ArrowLeft, Cookie, FileText, Mail, ShieldCheck } from 'lucide-react';

const policyIcons = {
  terms: FileText,
  privacy: ShieldCheck,
  cookies: Cookie,
};

export function PolicyPage({ type, title, summary, sections }) {
  const Icon = policyIcons[type] || FileText;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Serviqo home">
            <img src="/serviqo_favicon.png" alt="" className="h-9 w-9" />
            <span className="text-xl font-bold text-text-primary">Serviqo</span>
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-subtle"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#0d1b6e] via-[#173184] to-[#008b7a]">
          <div aria-hidden="true" className="absolute -right-20 -top-40 h-96 w-96 rounded-full border-[48px] border-white/5" />
          <div aria-hidden="true" className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-[#00d4b8]/10 blur-3xl" />
          <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Serviqo
            </Link>
            <div className="flex max-w-3xl items-start gap-4">
              <span className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#5decdb] sm:flex">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#5decdb]">Serviqo policies</p>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">{summary}</p>
                <p className="mt-6 text-sm font-medium text-white/70">Effective date: October 19, 2026</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
          <aside className="h-fit rounded-2xl border border-border bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-tertiary">On this page</p>
            <nav aria-label="Page sections" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {sections.map((section, index) => (
                <a
                  key={section.heading}
                  href={`#section-${index + 1}`}
                  className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-primary-subtle hover:text-primary"
                >
                  {section.heading}
                </a>
              ))}
            </nav>
          </aside>

          <article className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
              <div>
                <p className="text-sm font-semibold text-text-primary">{title}</p>
                <p className="mt-1 text-sm text-text-secondary">Please read this policy carefully.</p>
              </div>
              <a
                href="mailto:help@serviqo.com"
                className="inline-flex items-center gap-2 rounded-full bg-primary-subtle px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Contact support
              </a>
            </div>

            <div className="space-y-9">
              {sections.map((section, index) => (
                <section key={section.heading} id={`section-${index + 1}`} className="scroll-mt-8">
                  <h2 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
                    <span className="mr-2 text-text-accent">{String(index + 1).padStart(2, '0')}</span>
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-text-secondary sm:text-base">
                    {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.items && (
                      <ul className="list-disc space-y-2 pl-6 marker:text-text-accent">
                        {section.items.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-[#ccfaf4] bg-[#f0fdfb] p-5 sm:p-6">
              <h2 className="font-bold text-text-primary">Questions about this policy?</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Contact the Serviqo support team at{' '}
                <a className="font-semibold text-text-accent underline underline-offset-2" href="mailto:help@serviqo.com">
                  help@serviqo.com
                </a>
                .
              </p>
            </div>

            <nav aria-label="Other policies" className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-border pt-6 text-sm font-semibold">
              <Link href="/terms-of-service" className="text-text-accent hover:underline">Terms of Service</Link>
              <Link href="/privacy-policy" className="text-text-accent hover:underline">Privacy Policy</Link>
              <Link href="/cookie-policy" className="text-text-accent hover:underline">Cookie Policy</Link>
            </nav>
          </article>
        </div>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm text-text-secondary sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <span>© 2026 Serviqo. All rights reserved.</span>
          <a href="mailto:help@serviqo.com" className="font-medium text-text-accent hover:underline">
            help@serviqo.com
          </a>
        </div>
      </footer>
    </div>
  );
}
