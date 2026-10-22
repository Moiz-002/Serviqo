'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import * as api from '@/lib/api';
import { InlineLoadError, PageDataSkeleton } from '@/components/ui/LoadingStates';

function formatDate(value) {
  if (!value) return 'Recently posted';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date(value));
}

export default function PublicJobDetailPage() {
  const { jobId } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [bid, setBid] = useState({ amount: '', proposal: '', estimatedDays: '' });
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!jobId) return () => { cancelled = true; };

    api.getPublicJob(jobId)
      .then((data) => {
        if (!cancelled) setJob(data.job || data);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message || 'This job could not be found.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    api.getMe()
      .then((data) => {
        if (!cancelled) setUser(data.user || data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });

    return () => { cancelled = true; };
  }, [jobId]);

  const handleBidSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      router.push(`/login?role=worker&intendedUrl=${encodeURIComponent(`/jobs/${jobId}`)}`);
      return;
    }
    if (user.role !== 'worker') {
      setBidError('Bidding is available to professional worker accounts.');
      return;
    }
    const amount = Number(bid.amount);
    const estimatedDays = bid.estimatedDays ? Number(bid.estimatedDays) : undefined;
    if (!Number.isFinite(amount) || amount <= 0) {
      setBidError('Enter a bid amount greater than zero.');
      return;
    }
    if (bid.proposal.trim().length < 10) {
      setBidError('Your proposal must be at least 10 characters.');
      return;
    }
    if (estimatedDays !== undefined && (!Number.isInteger(estimatedDays) || estimatedDays < 1 || estimatedDays > 365)) {
      setBidError('Estimated days must be a whole number from 1 to 365.');
      return;
    }

    setIsSubmitting(true);
    setBidError('');
    setBidSuccess('');
    try {
      await api.submitBid({ jobId, amount, proposal: bid.proposal.trim(), estimatedDays });
      setBidSuccess('Your proposal has been sent to the customer.');
      setBid({ amount: '', proposal: '', estimatedDays: '' });
    } catch (error) {
      setBidError(error.message || 'Unable to submit your proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageDataSkeleton label="Loading job details" rows={4} />;
  if (loadError || !job) {
    return (
      <main className="min-h-screen bg-[#f5f8fc] px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <InlineLoadError message={loadError || 'This job is no longer available.'} onRetry={() => router.refresh()} />
          <Link href="/jobs" className="mt-6 inline-flex items-center gap-2 font-bold text-[#18366e] hover:text-cyan-700">
            <ArrowLeft className="h-4 w-4" /> Browse jobs
          </Link>
        </div>
      </main>
    );
  }

  const isWorker = user?.role === 'worker';
  const intendedUrl = encodeURIComponent(`/jobs/${jobId}`);

  return (
    <main className="min-h-screen bg-[#f5f8fc]">
      <header className="border-b border-white/10 bg-white text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <img src="/serviqo_favicon.png" alt="" className="h-9 w-9" />
            <span className="text-xl">Serviqo</span>
          </Link>
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All jobs
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-12">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-extrabold text-cyan-800">{job.category}</span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${job.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {job.status === 'open' ? 'Open for proposals' : job.status === 'active' ? 'In progress' : job.status}
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{job.title}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{[job.location?.area, job.location?.city].filter(Boolean).join(', ')}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Posted {formatDate(job.createdAt)}</span>
          </div>
          <div className="my-7 border-t border-slate-100" />
          <section>
            <h2 className="text-lg font-extrabold text-slate-900">Job details</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{job.description}</p>
          </section>
          {job.images?.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-extrabold text-slate-900">Customer photos</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {job.images.map((image, index) => (
                  <a key={`${image}-${index}`} href={api.getImageUrl(image)} target="_blank" rel="noopener noreferrer" className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                    <img src={api.getImageUrl(image)} alt={`Job photo ${index + 1}`} className="h-full w-full object-cover transition hover:scale-105" />
                  </a>
                ))}
              </div>
            </section>
          )}
          <section className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3">
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Budget</p><p className="mt-1 font-extrabold text-slate-900">{job.budgetRange}</p></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Timeline</p><p className="mt-1 font-extrabold capitalize text-slate-900">{job.urgency}</p></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Proposals</p><p className="mt-1 font-extrabold text-slate-900">{job.totalBids || 0}</p></div>
          </section>
          <div className="mt-7 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-[#17356a]"><ShieldCheck className="h-4 w-4 text-cyan-700" /> Keep communication and agreements clear</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">Job details are public. Account access is required to submit proposals or post a job.</p>
          </div>
        </article>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">Customer budget</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{job.budgetRange}</p>
          <p className="mt-1 text-sm text-slate-500">Submit a clear proposal for this request.</p>
          {job.status !== 'open' ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              This job is no longer accepting proposals. Browse the job board for current opportunities.
            </div>
          ) : !authChecked ? (
            <div className="mt-6 h-24 animate-pulse rounded-2xl bg-slate-100" />
          ) : isWorker ? (
            <form onSubmit={handleBidSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-bold text-slate-700">
                Your bid (PKR)
                <input type="number" min="1" step="1" required value={bid.amount} onChange={(event) => setBid((current) => ({ ...current, amount: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="e.g. 5000" />
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Estimated days (optional)
                <input type="number" min="1" max="365" step="1" value={bid.estimatedDays} onChange={(event) => setBid((current) => ({ ...current, estimatedDays: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="e.g. 2" />
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Proposal
                <textarea required minLength={10} maxLength={3000} rows={5} value={bid.proposal} onChange={(event) => setBid((current) => ({ ...current, proposal: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm font-normal outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100" placeholder="Describe your relevant experience and how you would complete the work." />
                <span className="mt-1 block text-right text-xs font-medium text-slate-400">{bid.proposal.length}/3000</span>
              </label>
              {bidError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{bidError}</p>}
              {bidSuccess && <p role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{bidSuccess}</p>}
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#142b59] px-5 text-sm font-extrabold text-white transition hover:bg-[#1b3a74] disabled:opacity-60">
                {isSubmitting ? 'Sending proposal…' : 'Submit a proposal'} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : user ? (
            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">A professional account is required to bid.</p>
              <p className="mt-1">You’re signed in as a {user.role}. You can still browse the job details.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <Link href={`/login?role=worker&intendedUrl=${intendedUrl}`} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#142b59] px-5 text-sm font-extrabold text-white transition hover:bg-[#1b3a74]">
                Sign in to submit a proposal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={`/signup?role=worker&intendedUrl=${intendedUrl}`} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50">
                Create a professional account
              </Link>
            </div>
          )}
          <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs font-medium text-slate-500">
            <BriefcaseBusiness className="h-4 w-4" /> {job.totalBids || 0} proposals received
          </div>
        </aside>
      </div>
    </main>
  );
}
