'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { DUMMY_ANALYTICS } from '@/config/admin-constants';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Analytics & Reporting</h1>
          <p className="text-neutral-500 mt-2">In-depth insights into platform performance and user growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-xl hover:bg-neutral-50 transition-colors">
            <Calendar className="w-5 h-5" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white font-bold rounded-xl hover:bg-navy-800 transition-colors shadow-sm">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-navy-50 rounded-lg text-navy-600">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-accent">
              <ArrowUpRight className="w-3 h-3" />
              12%
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-500">New Signups</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">1,240</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-accent">
              <ArrowUpRight className="w-3 h-3" />
              8%
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-500">Service Requests</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">456</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent-light rounded-lg text-accent">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-error">
              <ArrowDownRight className="w-3 h-3" />
              2%
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-500">Avg. Order Value</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">3,450 <span className="text-sm font-normal text-neutral-400">PKR</span></h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-navy-900 rounded-lg text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-accent">
              <ArrowUpRight className="w-3 h-3" />
              24%
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-500">Conversion Rate</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">18.5%</h3>
        </div>
      </div>

      {/* Visual Data Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">User Growth Trend</h2>
          <div className="aspect-[16/9] bg-neutral-50 rounded-3xl border border-neutral-100 flex items-end justify-between p-8 gap-4">
            {DUMMY_ANALYTICS.userGrowth.map((val, i) => (
              <div key={i} className="flex-1 bg-navy-600 rounded-t-xl relative group transition-all hover:bg-navy-700" style={{ height: `${(val / 400) * 100}%` }}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {val}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2 text-xs font-bold text-neutral-400">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Service Category Distribution</h2>
          <div className="space-y-6">
            {[
              { label: 'Electrical', value: 45, color: 'bg-navy-600' },
              { label: 'Cleaning', value: 30, color: 'bg-cyan-500' },
              { label: 'Plumbing', value: 15, color: 'bg-accent' },
              { label: 'Carpentry', value: 10, color: 'bg-neutral-400' },
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-neutral-700">
                  <span>{cat.label}</span>
                  <span>{cat.value}%</span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full transition-all duration-1000`} style={{ width: `${cat.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
