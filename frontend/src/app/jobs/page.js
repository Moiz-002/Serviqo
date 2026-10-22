'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import * as api from '@/lib/api';
import BrandedSelect from '@/components/ui/BrandedSelect';
import { getJobCategoryIcon } from '@/config/job-category-icons';
import { CATEGORIES, CITIES } from '@/config/worker-constants';
import { InlineLoadError, PageDataSkeleton } from '@/components/ui/LoadingStates';

const PAGE_SIZE = 12;
const CUSTOMER_POST_JOB_URL = '/customer/post-job';
const GUEST_POST_JOB_URL = '/login?role=customer&intendedUrl=%2Fcustomer%2Fpost-job';
const NEW_CUSTOMER_POST_JOB_URL = '/signup?role=customer&intendedUrl=%2Fcustomer%2Fpost-job';

function buildParams(filters, page) {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value.trim()) params.set(key, value.trim());
  });
  return params;
}

function formatPostedDate(value) {
  if (!value) return 'Recently posted';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(value));
}

export default function PublicJobsPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState({ q: '', city: '', category: '', urgency: '' });
  const [appliedFilters, setAppliedFilters] = useState({ q: '', city: '', category: '', urgency: '' });
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    api.getMe()
      .then((data) => {
        if (isCurrent) setCurrentUser(data.user || data);
      })
      .catch(() => {
        if (isCurrent) setCurrentUser(null);
      })
      .finally(() => {
        if (isCurrent) setAuthChecked(true);
      });
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = {
      q: params.get('q') || params.get('query') || '',
      city: params.get('city') || params.get('location') || '',
      category: params.get('category') || '',
      urgency: params.get('urgency') || '',
    };
    startTransition(() => {
      setFilters(initial);
      setAppliedFilters(initial);
    });
  }, []);

  useEffect(() => {
    let isCurrent = true;
    const fetchJobs = async () => {
      try {
        const result = await api.getPublicJobs(buildParams(appliedFilters, page).toString());
        if (!isCurrent) return;
        setJobs(result.jobs || []);
        setPagination({ total: result.total || 0, totalPages: result.totalPages || 0 });
        setLoadError('');
      } catch (error) {
        if (isCurrent) setLoadError(error.message || 'Could not load public jobs.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    fetchJobs();
    return () => { isCurrent = false; };
  }, [appliedFilters, page, reloadKey]);

  const applyFilters = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setPage(1);
    setAppliedFilters(filters);
    const params = buildParams(filters, 1);
    params.delete('page');
    params.delete('limit');
    const query = params.toString();
    router.replace(`/jobs${query ? `?${query}` : ''}`, { scroll: false });
  };

  const clearFilters = () => {
    const empty = { q: '', city: '', category: '', urgency: '' };
    setIsLoading(true);
    setFilters(empty);
    setAppliedFilters(empty);
    setPage(1);
    router.replace('/jobs', { scroll: false });
  };

  const changePage = (nextPage) => {
    setIsLoading(true);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const retryLoadJobs = () => {
    setIsLoading(true);
    setReloadKey((current) => current + 1);
  };

  return (
    <main className="min-h-screen bg-[#f5f8fc]">
      <header className="border-b border-white/10 bg-white text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <img src="/serviqo_favicon.png" alt="" className="h-9 w-9" />
            <span className="text-xl">Serviqo</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/" className="hidden rounded-xl px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10 sm:inline-flex">Home</Link>
            <Link href={
              !authChecked || !currentUser
                ? GUEST_POST_JOB_URL
                : currentUser.role === 'customer'
                  ? CUSTOMER_POST_JOB_URL
                  : NEW_CUSTOMER_POST_JOB_URL
            } className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-extrabold text-[#0b1735] transition hover:bg-cyan-300">
              Post a job
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0b1735] pb-16 pt-10 text-white sm:pb-20 sm:pt-14">
        <div aria-hidden="true" className="absolute -right-24 -top-44 h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
              <BriefcaseBusiness className="h-3.5 w-3.5" /> Customer job board
            </span>
            <h1 className="mt-5 text-4xl font-black !text-white tracking-tight sm:text-5xl lg:text-6xl">Find your next great job.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-blue-100/80 sm:text-lg">
              Explore customer requests across Pakistan. Browse freely; sign in as a verified professional to send a proposal.
            </p>
          </div>
          <form onSubmit={applyFilters} className="mt-9 grid gap-3 rounded-3xl border border-white/10 bg-white p-3 shadow-2xl shadow-black/20 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <label className="search-field flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-colors focus-within:border-cyan-600">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="sr-only">Search jobs</span>
              <input value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} placeholder="Job title or keywords" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" />
            </label>
            <label className="search-field flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-colors focus-within:border-cyan-600">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="sr-only">City</span>
              <BrandedSelect aria-label="Filter jobs by city" value={filters.city} onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))} containerClassName="flex-1" className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-slate-700">
                <option value="">All cities</option>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </BrandedSelect>
            </label>
            <label className="search-field flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-colors focus-within:border-cyan-600">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="sr-only">Service category</span>
              <BrandedSelect aria-label="Filter jobs by service category" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} getOptionIcon={getJobCategoryIcon} containerClassName="flex-1" className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-slate-700">
                <option value="">All services</option>
                {CATEGORIES.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
              </BrandedSelect>
            </label>
            <label className="search-field flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-colors focus-within:border-cyan-600">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="sr-only">Urgency</span>
              <BrandedSelect aria-label="Filter jobs by urgency" value={filters.urgency} onChange={(event) => setFilters((current) => ({ ...current, urgency: event.target.value }))} containerClassName="flex-1" className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-slate-700">
                <option value="">Any timeline</option>
                <option value="emergency">Emergency</option>
                <option value="today">Today</option>
                <option value="scheduled">Scheduled</option>
                <option value="flexible">Flexible</option>
              </BrandedSelect>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="min-h-12 flex-1 rounded-2xl bg-[#142b59] px-5 text-sm font-extrabold text-white transition hover:bg-[#1b3a74]">Search</button>
              <button type="button" onClick={clearFilters} aria-label="Clear filters" className="inline-flex min-h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"><X className="h-4 w-4" /></button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">The latest requests</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Customer job posts <span className="text-base font-semibold text-slate-400">({pagination.total})</span></h2>
          </div>
          <p className="text-sm font-medium text-slate-500">Requests posted by customers</p>
        </div>

        {isLoading ? (
          <PageDataSkeleton label="Loading public job listings" rows={4} />
        ) : loadError ? (
          <InlineLoadError message={loadError} onRetry={retryLoadJobs} />
        ) : jobs.length ? (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {jobs.map((job) => {
                const CategoryIcon = getJobCategoryIcon(job.category);
                return <article key={job._id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-extrabold text-cyan-800">
                      <CategoryIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      {job.category}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold capitalize text-emerald-700">{job.urgency || 'Open'}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-900">{job.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{[job.location?.area, job.location?.city].filter(Boolean).join(', ') || 'Location not specified'}</span>
                    <span>{job.budgetRange}</span>
                    <span>{job.totalBids || 0} proposals</span>
                    <span>Posted {formatPostedDate(job.createdAt)}</span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className={`text-xs font-bold capitalize ${job.status === 'open' ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {job.status === 'open' ? 'Accepting proposals' : job.status === 'active' ? 'In progress' : job.status}
                    </span>
                    <Link href={`/jobs/${job._id}`} className="inline-flex items-center gap-2 text-sm font-extrabold text-[#18366e] transition group-hover:text-cyan-700">
                      View job <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>;
              })}
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button type="button" disabled={page <= 1 || isLoading} onClick={() => changePage(page - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40">Previous</button>
                <span className="text-sm font-semibold text-slate-500">Page {page} of {pagination.totalPages}</span>
                <button type="button" disabled={page >= pagination.totalPages || isLoading} onClick={() => changePage(page + 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40">Next</button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">No matching jobs</h3>
            <p className="mt-2 text-sm text-slate-500">Try another keyword or clear the filters to see all customer posts.</p>
            <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-[#142b59] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1b3a74]">Clear filters</button>
          </div>
        )}
      </section>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Serviqo</span>
          <Link href="/" className="font-bold text-[#18366e] hover:text-cyan-700">Back to home</Link>
        </div>
      </footer>
    </main>
  );
}
