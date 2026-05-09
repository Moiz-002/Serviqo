'use client';

import React, { useState, useEffect } from 'react';
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
import * as api from '@/lib/api';

export default function DisputeManagementPage() {
  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState('open');

  useEffect(() => {
    api.getAdminDisputes()
      .then((data) => setDisputes(data.disputes || []))
      .catch(() => {});
  }, []);

  const handleResolve = async (disputeId) => {
    try {
      await api.resolveDispute(disputeId, { resolution: 'Resolved by admin' });
      setDisputes((prev) => prev.map((d) => d._id === disputeId ? { ...d, status: 'resolved' } : d));
    } catch {}
  };

  const displayed = disputes.filter((d) => filter === 'open' ? d.status !== 'resolved' : d.status === 'resolved');
  const criticalCount = disputes.filter((d) => d.status !== 'resolved' && d.priority === 'high').length;

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
          {criticalCount > 0 && (
            <div className="px-4 py-2 bg-error-light text-error text-sm font-bold rounded-full border border-error-light flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {criticalCount} CRITICAL DISPUTE{criticalCount !== 1 ? 'S' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-[32px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Active Disputes</h2>
          <div className="flex gap-2">
            <button onClick={() => setFilter('open')} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${filter === 'open' ? 'bg-navy-900 text-white border-navy-900' : 'text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}>Open</button>
            <button onClick={() => setFilter('resolved')} className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${filter === 'resolved' ? 'bg-navy-900 text-white border-navy-900' : 'text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}>Resolved</button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {displayed.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">No {filter} disputes.</div>
          ) : displayed.map((dispute) => (
            <div key={dispute._id} className="p-6 hover:bg-neutral-50 transition-colors group">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    dispute.status !== 'resolved' ? 'bg-error-light text-error' : 'bg-accent-50 text-accent-600'
                  }`}>
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-neutral-900">
                        {dispute.reason || dispute.description || 'Dispute'}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(dispute.priority || 'low')}`}>
                        {(dispute.priority || 'low')} Priority
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                      <div className="flex items-center gap-2 text-neutral-500">
                        <User className="w-4 h-4" />
                        <span className="font-semibold text-neutral-700">Complainant:</span> {dispute.raisedBy?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Flag className="w-4 h-4" />
                        <span className="font-semibold text-neutral-700">Against:</span> {dispute.againstUser?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-semibold text-neutral-700">Job:</span> {dispute.job?.title || String(dispute.job || '').slice(-6) || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold text-neutral-700">Status:</span>
                        <span className={dispute.status !== 'resolved' ? 'text-error' : 'text-accent-600'}>
                          {(dispute.status || 'open').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {dispute.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(dispute._id)}
                      className="px-5 py-2.5 bg-navy-900 text-white text-sm font-bold rounded-xl hover:bg-navy-800 transition-colors shadow-sm"
                    >
                      Resolve
                    </button>
                  )}
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
