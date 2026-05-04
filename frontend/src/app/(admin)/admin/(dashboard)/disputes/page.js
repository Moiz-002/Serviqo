'use client';

import React from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Flag
} from 'lucide-react';
import { DUMMY_DISPUTES } from '@/config/admin-constants';

export default function DisputeManagementPage() {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'bg-error-light text-error';
      case 'medium': return 'bg-warning-light text-warning';
      default: return 'bg-primary-50 text-primary-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Disputes & Complaints</h1>
          <p className="text-neutral-500 mt-2">Mediate conflicts and resolve platform disputes between users.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-error-light text-error text-sm font-bold rounded-full border border-error-light flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            3 CRITICAL DISPUTES
          </div>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Active Disputes</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors border border-neutral-200">Open</button>
            <button className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 rounded-xl transition-colors">Resolved</button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {DUMMY_DISPUTES.map((dispute) => (
            <div key={dispute.id} className="p-6 hover:bg-neutral-50 transition-colors group">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    dispute.status === 'open' ? 'bg-error-light text-error' : 'bg-accent-50 text-accent-600'
                  }`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-neutral-900">
                        {dispute.reason}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(dispute.priority)}`}>
                        {dispute.priority} Priority
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <User className="w-4 h-4" />
                        <span className="font-semibold text-neutral-700">Complainant:</span> {dispute.complainant}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Flag className="w-4 h-4" />
                        <span className="font-semibold text-neutral-700">Accused:</span> {dispute.accused}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-semibold text-neutral-700">Job ID:</span> {dispute.jobId}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold text-neutral-700">Status:</span> 
                        <span className={dispute.status === 'open' ? 'text-error' : 'text-accent-600'}>
                          {dispute.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 bg-navy-900 text-white text-sm font-bold rounded-xl hover:bg-navy-800 transition-colors shadow-sm">
                    Investigate
                  </button>
                  <button className="p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-400 hover:text-neutral-900 transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-center">
           <button className="text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors">
            Load More Disputes
          </button>
        </div>
      </div>
    </div>
  );
}
