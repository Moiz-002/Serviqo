'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Tag, 
  MessageSquare, 
  ChevronRight,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { DUMMY_JOBS, CATEGORIES, BUDGET_RANGES, URGENCY_LEVELS } from '@/config/job-constants';
import Card from '@/components/ui/Card';

export default function MyJobsPage() {
  const [filter, setFilter] = useState('all');

  const filteredJobs = filter === 'all' 
    ? DUMMY_JOBS 
    : DUMMY_JOBS.filter(job => job.status === filter);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'open': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'active': return 'bg-primary-50 text-primary-700 border-primary-100';
      case 'completed': return 'bg-neutral-50 text-neutral-600 border-neutral-200';
      default: return 'bg-neutral-50 text-neutral-600';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">My Job Requests</h1>
            <p className="text-neutral-500 mt-1">Track and manage your service postings.</p>
          </div>
          <Link 
            href="/job/post" 
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 w-fit"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </Link>
        </div>

        {/* Stats & Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex bg-white p-1 rounded-2xl border border-neutral-200 w-full md:w-fit">
            {['all', 'open', 'active', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all
                  ${filter === f ? 'bg-primary-500 text-white shadow-md' : 'text-neutral-500 hover:text-neutral-700'}
                `}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search your jobs..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-sm outline-none focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Link key={job.id} href={`/job/${job.id}`}>
                <Card className="p-6 md:p-8 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/5 transition-all group border-neutral-200/60 mb-6 block">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Image Thumbnail */}
                    <div className="w-full lg:w-48 h-48 lg:h-32 rounded-2xl overflow-hidden shrink-0 border border-neutral-100">
                      <img 
                        src={job.images[0] || 'https://via.placeholder.com/300?text=No+Image'} 
                        alt={job.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className={`
                            text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 inline-block
                            ${getStatusStyle(job.status)}
                          `}>
                            {job.status}
                          </span>
                          <h2 className="text-xl font-bold text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                            {job.title}
                          </h2>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-primary-50 transition-colors">
                          <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-500" />
                        </div>
                      </div>

                      <p className="text-neutral-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-y-4 gap-x-6">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <MapPin className="w-4 h-4 text-accent-600" />
                          <span className="text-xs font-bold">{job.location.area}, {job.location.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold capitalize">{job.urgency}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Tag className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold uppercase tracking-tight">
                            {BUDGET_RANGES.find(b => b.id === job.budget)?.range}
                          </span>
                        </div>
                        <div className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full border border-primary-100">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs font-black">{job.proposalsCount} Bids</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-neutral-200">
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-neutral-300" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">No jobs found</h3>
              <p className="text-neutral-500 mt-2 max-w-xs mx-auto">You haven&apos;t posted any service requests in this category yet.</p>
              <Link 
                href="/job/post" 
                className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all"
              >
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
