'use client';

import React from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Star, 
  TrendingUp, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { DUMMY_WORKER } from '@/config/worker-constants';

const StatCard = ({ icon: Icon, label, value, trend, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-accent-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          {trend}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-neutral-900 mt-1">{value}</h3>
    </div>
  </div>
);

export default function WorkerDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Welcome back, {DUMMY_WORKER.displayName}!
          </h1>
          <p className="text-neutral-500 mt-1">
            Here&apos;s what&apos;s happening with your profile today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/worker/profile" 
            className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            View Profile
          </Link>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 shadow-sm transition-colors">
            Find Jobs
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={Briefcase} 
          label="Completed Jobs" 
          value={DUMMY_WORKER.completedJobs} 
          trend="+12% this month"
          colorClass="bg-primary-100 text-primary-600"
        />
        <StatCard 
          icon={Star} 
          label="Average Rating" 
          value={DUMMY_WORKER.rating} 
          trend="Top 5% in city"
          colorClass="bg-accent-100 text-accent-600"
        />
        <StatCard 
          icon={Clock} 
          label="Response Time" 
          value={DUMMY_WORKER.responseTime} 
          colorClass="bg-secondary-100 text-secondary-600"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Profile Strength" 
          value="95%" 
          colorClass="bg-emerald-100 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Active Proposals</h2>
              <Link href="/worker/proposals" className="text-primary-600 text-sm font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-neutral-100">
              {[
                { title: 'Full House Wiring', client: 'Sarah J.', status: 'Pending', price: '45,000 PKR' },
                { title: 'AC Installation', client: 'M. Ibrahim', status: 'Negotiating', price: '8,000 PKR' },
                { title: 'Smart Switch Setup', client: 'Office Co.', status: 'Active', price: '12,500 PKR' },
              ].map((job, idx) => (
                <div key={idx} className="p-4 md:p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{job.title}</h4>
                    <p className="text-sm text-neutral-500 mt-1">Client: {job.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900">{job.price}</p>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      job.status === 'Active' ? 'bg-accent-100 text-accent-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Recommended Jobs for You</h2>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-bold text-neutral-900">New job matches available!</h3>
              <p className="text-neutral-500 text-sm max-w-xs mt-2">
                There are 14 new electrical jobs in Islamabad that match your skills.
              </p>
              <button className="mt-6 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                Browse Recommendations
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar / Notifications */}
        <div className="space-y-6">
          <div className="bg-primary-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-800 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold">Serviqo Pro Tips</h3>
              <p className="text-primary-100 text-sm mt-3 leading-relaxed">
                Profiles with more than 5 portfolio images get <span className="text-accent-400 font-bold">45% more job invitations</span>.
              </p>
              <Link 
                href="/worker/portfolio" 
                className="inline-block mt-6 px-5 py-2 bg-white text-primary-900 rounded-full text-sm font-bold hover:bg-primary-50 transition-colors"
              >
                Add Photos
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Action Required</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-3 p-3 bg-errorLight border border-error/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-error shrink-0" />
                <div>
                  <p className="text-sm font-bold text-neutral-900">Identity verification</p>
                  <p className="text-xs text-neutral-600 mt-1">Upload your CNIC to unlock bidding on high-value jobs.</p>
                  <button className="text-xs font-bold text-error mt-2 hover:underline">Verify Now</button>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-neutral-900">Update availability</p>
                  <p className="text-xs text-neutral-600 mt-1">You haven&apos;t updated your schedule for Eid holidays.</p>
                  <button className="text-xs font-bold text-amber-700 mt-2 hover:underline">Update Schedule</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
