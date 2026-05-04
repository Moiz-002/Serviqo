'use client';

import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Tag, 
  Search, 
  Filter,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DUMMY_PLATFORM_ACTIVITY } from '@/config/admin-constants';

export default function PlatformActivityPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
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

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Active Bidding</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">24 Jobs</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">In Progress</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">156 Projects</h3>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Completed Today</p>
          <h3 className="text-2xl font-bold text-accent-600 mt-1">42 Finished</h3>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-neutral-900">Recent Job Activity</h2>
          <div className="flex items-center gap-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search jobs..." 
                className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button className="p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-500">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {DUMMY_PLATFORM_ACTIVITY.map((job) => (
            <div key={job.id} className="p-6 hover:bg-neutral-50 transition-colors group">
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
                        {job.id}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-700">Customer:</span> {job.customer}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-700">Worker:</span> {job.worker}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-bold text-neutral-900">{job.budget}</p>
                  </div>
                  
                  <div className="min-w-[120px]">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-full justify-center ${
                      job.status === 'completed' ? 'bg-accent-50 text-accent-700 border border-accent-100' :
                      job.status === 'in_progress' ? 'bg-info-light text-info border border-info-light' :
                      'bg-warning-light text-warning border border-warning-light'
                    }`}>
                      {job.status.replace('_', ' ').toUpperCase()}
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
          <button className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-2 mx-auto">
            View Historical Data
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
