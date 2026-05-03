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
  ArrowUpRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { DUMMY_JOBS, CATEGORIES, BUDGET_RANGES } from '@/config/job-constants';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function MyJobsPage() {
  const [filter, setFilter] = useState('all');

  const filteredJobs = filter === 'all' 
    ? DUMMY_JOBS 
    : DUMMY_JOBS.filter(job => job.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': 
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-success-light text-success font-black text-[10px] uppercase tracking-widest rounded-full border border-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Open Bidding
          </span>
        );
      case 'active': 
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-subtle text-primary font-black text-[10px] uppercase tracking-widest rounded-full border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            In Progress
          </span>
        );
      case 'completed': 
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-full border border-border">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">My Job Requests</h1>
          <p className="text-text-secondary mt-1 font-medium italic">Track progress, review bids, and manage your active services.</p>
        </div>
        <Link href="/customer/post-job">
          <Button variant="primary" size="lg" className="rounded-2xl gap-2 shadow-xl shadow-primary/20 group">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Control Bar */}
      <Card className="p-4 border-neutral-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-neutral-100 p-1 rounded-xl w-full md:w-fit">
          {['all', 'open', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black capitalize transition-all
                ${filter === f 
                  ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' 
                  : 'text-text-tertiary hover:text-text-secondary'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search your jobs..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-border rounded-xl text-sm font-medium outline-none focus:border-primary transition-all text-text-primary placeholder:text-text-tertiary"
          />
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Link key={job.id} href={`/customer/job/${job.id}`}>
              <Card className="p-0 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden border-neutral-200/60 mb-6 block relative">
                <div className="flex flex-col lg:flex-row">
                  {/* Image Section */}
                  <div className="w-full lg:w-56 h-48 lg:h-auto shrink-0 relative overflow-hidden bg-neutral-100">
                    <img 
                      src={job.images[0] || 'https://via.placeholder.com/300?text=No+Image'} 
                      alt={job.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(job.status)}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-6 md:p-8 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-1">
                            {CATEGORIES.find(c => c.id === job.category)?.name}
                          </p>
                          <h2 className="text-xl font-black text-text-primary truncate group-hover:text-primary transition-colors leading-tight">
                            {job.title}
                          </h2>
                        </div>
                        <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-primary-subtle transition-colors">
                          <ArrowUpRight className="w-5 h-5 text-text-tertiary group-hover:text-primary" />
                        </div>
                      </div>

                      <p className="text-text-secondary text-sm line-clamp-2 mb-8 leading-relaxed font-medium">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-4 gap-x-8 pt-6 border-t border-neutral-100">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <MapPin className="w-4 h-4 text-accent" />
                        <span className="text-xs font-black uppercase tracking-tight">{job.location.area}, {job.location.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-xs font-black uppercase tracking-tight">{job.urgency}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Tag className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-tight">
                          {BUDGET_RANGES.find(b => b.id === job.budget)?.range}
                        </span>
                      </div>
                      
                      <div className="ml-auto flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary-subtle text-primary rounded-full border border-primary/10">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs font-black tracking-widest">{job.proposalsCount} Bids</span>
                        </div>
                        {job.status === 'open' && job.proposalsCount > 0 && (
                          <div className="text-[10px] font-black text-accent uppercase animate-pulse">
                            New Bids!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-neutral-200 space-y-6">
            <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-neutral-50/50">
              <Briefcase className="w-10 h-10 text-text-tertiary" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-text-primary">No jobs found</h3>
              <p className="text-text-secondary mt-2 max-w-sm mx-auto font-medium">You don&apos;t have any service requests in this category. Ready to get started?</p>
            </div>
            <Link href="/customer/post-job" className="inline-block">
              <Button variant="primary" size="lg" className="rounded-2xl px-12">
                Post Your First Job
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <Card className="p-6 bg-primary-subtle border-primary/10 flex gap-6 items-center">
        <div className="p-4 bg-white rounded-2xl shadow-sm shrink-0">
          <AlertCircle className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h4 className="font-black text-primary uppercase tracking-widest text-xs">Customer Safety Tip</h4>
          <p className="text-sm text-text-secondary mt-1 font-medium leading-relaxed">
            Never pay for services outside of the platform. Serviqo protects your payments until the job is completed and you are 100% satisfied.
          </p>
        </div>
      </Card>
    </div>
  );
}
