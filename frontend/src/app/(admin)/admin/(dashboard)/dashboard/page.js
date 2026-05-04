'use client';

import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  Briefcase, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DUMMY_ANALYTICS, DUMMY_PLATFORM_ACTIVITY } from '@/config/admin-constants';

const StatsCard = ({ title, value, change, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <h3 className="text-2xl font-bold text-neutral-900 mt-1">{value}</h3>
        {change && (
          <p className={`text-xs font-semibold mt-2 flex items-center gap-1 ${
            change.startsWith('+') ? 'text-accent-600' : 'text-error'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {change} <span className="text-neutral-400 font-normal">from last month</span>
          </p>
        )}
      </div>
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard Overview</h1>
        <p className="text-neutral-500 mt-2">Welcome back, Admin. Here's what's happening on Serviqo today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Users" 
          value={DUMMY_ANALYTICS.totalUsers.toLocaleString()} 
          change={DUMMY_ANALYTICS.growthRate}
          icon={Users}
          colorClass="bg-navy-50 text-navy-600"
        />
        <StatsCard 
          title="Active Workers" 
          value={DUMMY_ANALYTICS.totalWorkers.toLocaleString()} 
          change="+8.2%"
          icon={ShieldCheck}
          colorClass="bg-cyan-50 text-cyan-600"
        />
        <StatsCard 
          title="Active Jobs" 
          value={DUMMY_ANALYTICS.activeJobs} 
          change="+15.4%"
          icon={Briefcase}
          colorClass="bg-accent-light text-accent"
        />
        <StatsCard 
          title="Total Revenue" 
          value={DUMMY_ANALYTICS.totalRevenue} 
          change="+22.1%"
          icon={TrendingUp}
          colorClass="bg-navy-900 text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Recent Platform Activity</h2>
              <button className="text-sm font-semibold text-navy-600 hover:text-navy-700">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                    <th className="pb-4">Job Details</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Worker</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {DUMMY_PLATFORM_ACTIVITY.map((job) => (
                    <tr key={job.id} className="group hover:bg-neutral-50/50 transition-colors">
                      <td className="py-4">
                        <p className="text-sm font-semibold text-neutral-900">{job.title}</p>
                        <p className="text-xs text-neutral-400">ID: {job.id}</p>
                      </td>
                      <td className="py-4 text-sm text-neutral-600">{job.customer}</td>
                      <td className="py-4 text-sm text-neutral-600">{job.worker}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'completed' ? 'bg-cyan-50 text-cyan-700' :
                          job.status === 'in_progress' ? 'bg-primary-subtle text-primary' :
                          'bg-warning-light text-warning'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-bold text-neutral-900">{job.budget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-neutral-200 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-50/50 border border-cyan-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-medium text-neutral-900">API Servers</span>
                </div>
                <span className="text-xs font-bold text-cyan-600">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-cyan-50/50 border border-cyan-100">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                  <span className="text-sm font-medium text-neutral-900">Database</span>
                </div>
                <span className="text-xs font-bold text-cyan-600">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-warning-light/50 border border-warning-light">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium text-neutral-900">Media Storage</span>
                </div>
                <span className="text-xs font-bold text-warning">SLOW</span>
              </div>
            </div>
          </div>

          <div className="bg-navy-900 p-6 rounded-[32px] text-white">
            <h2 className="text-lg font-bold mb-4">Pending Verifications</h2>
            <p className="text-navy-100 text-sm mb-6">There are 12 new worker verification requests waiting for your review.</p>
            <button className="w-full py-3 bg-white text-navy-900 font-bold rounded-2xl hover:bg-navy-50 transition-colors">
              Review Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
