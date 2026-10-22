'use client';

import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import * as api from '@/lib/api';
import { InlineLoadError, PageDataSkeleton } from '@/components/ui/LoadingStates';

const DAY_MS = 24 * 60 * 60 * 1000;
const CATEGORY_COLORS = ['bg-navy-600', 'bg-cyan-500', 'bg-accent', 'bg-emerald-500', 'bg-violet-500'];

function defaultDateRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 29 * DAY_MS);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00.000Z`));
}

function exportAnalyticsPdf(analytics, startDate, endDate) {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const left = 16;
  let y = 20;

  const addPageIfNeeded = (space = 12) => {
    if (y + space > pageHeight - 16) {
      pdf.addPage();
      y = 20;
    }
  };
  const addLine = (label, value) => {
    addPageIfNeeded();
    pdf.setFont('helvetica', 'normal');
    pdf.text(String(label), left, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(String(value), 105, y);
    y += 9;
  };

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('Serviqo Analytics Report', left, y);
  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(`Date range: ${startDate} to ${endDate}`, left, y);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, left, y + 7);
  y += 20;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Key metrics', left, y);
  y += 10;
  pdf.setFontSize(11);
  addLine('New users', analytics.users?.total ?? 0);
  addLine('New customers', analytics.users?.customers ?? 0);
  addLine('New workers', analytics.users?.workers ?? 0);
  addLine('Jobs created', analytics.jobs?.total ?? 0);
  addLine('Active jobs created in range', analytics.jobs?.active ?? 0);
  addLine('Completed jobs created in range', analytics.jobs?.completed ?? 0);
  addLine('Pending worker verifications', analytics.pendingVerifications ?? 0);
  addLine('Open disputes created in range', analytics.openDisputes ?? 0);

  y += 3;
  addPageIfNeeded(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Jobs by service category', left, y);
  y += 10;
  pdf.setFontSize(10);
  (analytics.categories || []).forEach((category) => {
    addLine(category.name, `${category.count} (${category.percentage}%)`);
  });

  y += 3;
  addPageIfNeeded(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Daily activity', left, y);
  y += 10;
  pdf.setFontSize(9);
  (analytics.trend || []).forEach((day) => {
    addPageIfNeeded();
    pdf.setFont('helvetica', 'normal');
    pdf.text(day.date, left, y);
    pdf.text(`Users: ${day.users}`, 75, y);
    pdf.text(`Jobs: ${day.jobs}`, 125, y);
    y += 7;
  });

  pdf.save(`serviqo-analytics-${startDate}-to-${endDate}.pdf`);
}

function MetricCard({ title, value, icon: Icon, colorClass, description }) {
  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`rounded-xl p-2.5 ${colorClass}`}><Icon className="h-5 w-5" /></div>
        <span className="text-right text-xs font-medium text-neutral-400">{description}</span>
      </div>
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <h3 className="mt-1 text-2xl font-bold text-neutral-900">{Number(value || 0).toLocaleString()}</h3>
    </div>
  );
}

export default function AnalyticsPage() {
  const initialRange = defaultDateRange();
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [appliedRange, setAppliedRange] = useState(initialRange);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [rangeError, setRangeError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadAnalytics = async () => {
      setIsLoading(true);
      setLoadError('');
      setAnalytics(null);
      try {
        const query = new URLSearchParams(appliedRange).toString();
        const result = await api.getAdminAnalytics(query);
        if (!cancelled) setAnalytics(result.analytics || result);
      } catch (error) {
        if (!cancelled) setLoadError(error.message || 'Unable to load analytics.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadAnalytics();
    return () => { cancelled = true; };
  }, [appliedRange, refreshToken]);

  const applyDateRange = (event) => {
    event.preventDefault();
    setRangeError('');
    if (!startDate || !endDate || startDate > endDate) {
      setRangeError('Choose a valid start and end date.');
      return;
    }
    if (new Date(`${endDate}T00:00:00Z`) - new Date(`${startDate}T00:00:00Z`) >= 366 * DAY_MS) {
      setRangeError('Choose a date range of 366 days or less.');
      return;
    }
    setAppliedRange({ startDate, endDate });
  };

  const handleExport = async () => {
    if (!analytics || isExporting) return;
    setIsExporting(true);
    try {
      exportAnalyticsPdf(analytics, appliedRange.startDate, appliedRange.endDate);
    } catch (error) {
      setLoadError(error.message || 'Unable to export the analytics report.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !analytics) return <PageDataSkeleton label="Loading platform analytics" rows={4} />;
  if (!analytics && loadError) {
    return (
      <div className="mx-auto max-w-7xl">
        <InlineLoadError message={loadError} onRetry={() => setRefreshToken((value) => value + 1)} />
      </div>
    );
  }
  if (!analytics) return null;

  const trend = analytics.trend || [];
  const maxTrendValue = Math.max(1, ...trend.flatMap((day) => [day.users, day.jobs]));
  const categories = analytics.categories || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {loadError && <InlineLoadError message={loadError} onRetry={() => setRefreshToken((value) => value + 1)} />}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">Platform insights</p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">Analytics &amp; Reporting</h1>
          <p className="mt-2 text-neutral-500">Explore real platform activity for a selected date range.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <form onSubmit={applyDateRange} className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1.5 text-xs font-semibold text-neutral-600">
              Start date
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800"
                required
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-neutral-600">
              End date
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setEndDate(event.target.value)}
                className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-800"
                required
              />
            </label>
            <button type="submit" disabled={isLoading} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-neutral-700 shadow-sm ring-1 ring-neutral-200 transition hover:bg-neutral-50 disabled:opacity-60">
              <Calendar className="h-4 w-4" />
              Apply
            </button>
          </form>
          <button
            type="button"
            onClick={handleExport}
            disabled={isLoading || isExporting}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Preparing PDF…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {rangeError && <p role="alert" className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">{rangeError}</p>}
      {isLoading && <p role="status" className="flex items-center gap-2 text-sm font-medium text-neutral-500"><RefreshCw className="h-4 w-4 animate-spin" />Updating analytics…</p>}
      <p className="text-sm text-neutral-500">
        Showing data from <strong className="text-neutral-700">{appliedRange.startDate}</strong> through <strong className="text-neutral-700">{appliedRange.endDate}</strong>. Counts include records created in this range.
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="New Signups" value={analytics.users?.total} icon={Users} colorClass="bg-navy-50 text-navy-600" description="Customers + workers" />
        <MetricCard title="Jobs Created" value={analytics.jobs?.total} icon={Briefcase} colorClass="bg-cyan-50 text-cyan-600" description="In selected range" />
        <MetricCard title="Completed Jobs" value={analytics.jobs?.completed} icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600" description="Created in selected range" />
        <MetricCard title="New Workers" value={analytics.users?.workers} icon={BarChart3} colorClass="bg-violet-50 text-violet-600" description="Joined in selected range" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[32px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Daily activity</h2>
              <p className="mt-1 text-sm text-neutral-500">New user accounts and jobs by creation date</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-neutral-500">
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-navy-600" />Users</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cyan-500" />Jobs</span>
            </div>
          </div>
          {trend.length ? (
            <div className="mt-7 overflow-x-auto pb-2">
              <div className="flex h-56 min-w-full items-end gap-2" style={{ minWidth: `${Math.max(100, trend.length * 22)}px` }}>
                {trend.map((day) => (
                  <div key={day.date} className="group flex h-full min-w-[18px] flex-1 flex-col items-center justify-end gap-1">
                    <div className="flex h-full w-full items-end justify-center gap-0.5">
                      <div title={`${day.users} users on ${day.date}`} className="w-1/2 rounded-t bg-navy-600 transition-opacity group-hover:opacity-75" style={{ height: `${Math.max(day.users ? 3 : 0, (day.users / maxTrendValue) * 100)}%` }} />
                      <div title={`${day.jobs} jobs on ${day.date}`} className="w-1/2 rounded-t bg-cyan-500 transition-opacity group-hover:opacity-75" style={{ height: `${Math.max(day.jobs ? 3 : 0, (day.jobs / maxTrendValue) * 100)}%` }} />
                    </div>
                    {(trend.length <= 14 || trend.indexOf(day) % Math.ceil(trend.length / 10) === 0) && (
                      <span className="whitespace-nowrap text-[9px] text-neutral-400">{formatDate(day.date)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-neutral-50 p-10 text-center text-sm text-neutral-500">No activity in this date range.</div>
          )}
        </section>

        <section className="rounded-[32px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-neutral-900">Service category distribution</h2>
          <p className="mt-1 text-sm text-neutral-500">Jobs created by category in the selected range</p>
          <div className="mt-7 space-y-5">
            {categories.length ? categories.map((category, index) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between gap-3 text-sm font-semibold text-neutral-700">
                  <span className="truncate">{category.name}</span>
                  <span className="shrink-0">{category.count} · {category.percentage}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div className={`h-full rounded-full ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}`} style={{ width: `${category.percentage}%` }} />
                </div>
              </div>
            )) : (
              <div className="rounded-2xl bg-neutral-50 p-10 text-center text-sm text-neutral-500">No categorized jobs in this date range.</div>
            )}
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-neutral-100 pt-5 text-sm">
            <div><p className="text-neutral-500">Active jobs created in range</p><p className="mt-1 font-bold text-neutral-900">{Number(analytics.jobs?.active || 0).toLocaleString()}</p></div>
            <div><p className="text-neutral-500">Open disputes</p><p className="mt-1 font-bold text-neutral-900">{Number(analytics.openDisputes || 0).toLocaleString()}</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
