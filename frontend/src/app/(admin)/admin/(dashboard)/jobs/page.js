'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import * as api from '@/lib/api';

export default function PlatformActivityPage() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ open: 0, active: 0, completed: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.getAdminJobs()
      .then((data) => {
        const all = data.jobs || [];
        setJobs(all);
        setStats({
          open: all.filter((j) => j.status === 'open').length,
          active: all.filter((j) => j.status === 'active').length,
          completed: all.filter((j) => j.status === 'completed').length,
        });
      })
      .catch(() => {});
  }, []);

  const displayed = jobs.filter((j) =>
    !searchTerm || j.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Platform Activity</h1>
          <p className="text-neutral-500 mt-2">Monitor real-time job postings, bids, and project completions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-accent-50 text-accent-700 text-sm font-bold rounded-full border border-accent-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
            LIVE MONITORING
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Active Bidding</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stats.open} Jobs</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">In Progress</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stats.active} Projects</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Completed</p>
          <h3 className="text-2xl font-bold text-accent-600 mt-1">{stats.completed} Finished</h3>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-neutral-900">Recent Job Activity</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button className="p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-500">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {displayed.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">No jobs found.</div>
          ) : displayed.map((job) => (
            <div key={job._id} className="p-6 hover:bg-neutral-50 transition-colors group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-md uppercase">
                        {String(job._id).slice(-6)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-700">Customer:</span> {job.customer?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-700">Worker:</span> {job.assignedWorker?.name || 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-bold text-neutral-900">{job.budgetRange || '—'}</p>
                  </div>

                  <div className="min-w-[120px]">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-full justify-center ${
                      job.status === 'completed' ? 'bg-accent-50 text-accent-700 border border-accent-100' :
                      job.status === 'active' ? 'bg-info-light text-info border border-info-light' :
                      'bg-warning-light text-warning border border-warning-light'
                    }`}>
                      {(job.status || 'open').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <button className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-400 group-hover:text-primary-600 group-hover:border-primary-200 transition-all">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-neutral-50/50 border-t border-neutral-100 text-center">
          <p className="text-sm text-neutral-400">{displayed.length} jobs total</p>
        </div>
      </div>
    </div>
  );
}
