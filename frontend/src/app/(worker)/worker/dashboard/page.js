'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  MapPin,
  Tag,
  X,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import * as api from '@/lib/api';

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
  const [worker, setWorker] = useState(null);
  const [bids, setBids] = useState([]);
  const [openJobs, setOpenJobs] = useState([]);
  const [bidModal, setBidModal] = useState(null);
  const [bidForm, setBidForm] = useState({ amount: '', proposal: '', estimatedDays: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');

  useEffect(() => {
    api.getMe().then((data) => setWorker(data.user || data)).catch(() => {});
    api.getMyBids().then((data) => setBids(data.bids || [])).catch(() => {});
    api.getJobs().then((data) => setOpenJobs(data.jobs || [])).catch(() => {});
  }, []);

  const firstName = worker?.name?.split(' ')[0] || 'there';

  const alreadyBid = (jobId) => bids.some((b) => b.job?._id === jobId || b.job === jobId);

  const openBidModal = (job) => {
    setBidModal(job);
    setBidForm({ amount: '', proposal: '', estimatedDays: '' });
    setBidError('');
    setBidSuccess('');
  };

  const handleBidSubmit = async () => {
    if (!bidForm.amount || !bidForm.proposal) {
      setBidError('Amount and proposal are required.');
      return;
    }
    setIsSubmitting(true);
    setBidError('');
    try {
      await api.submitBid({
        jobId: bidModal._id,
        amount: Number(bidForm.amount),
        proposal: bidForm.proposal,
        estimatedDays: bidForm.estimatedDays ? Number(bidForm.estimatedDays) : undefined,
      });
      setBidSuccess('Bid submitted successfully!');
      api.getMyBids().then((data) => setBids(data.bids || [])).catch(() => {});
      setTimeout(() => setBidModal(null), 1500);
    } catch (err) {
      setBidError(err.message || 'Failed to submit bid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Welcome back, {firstName}!
          </h1>
          <p className="text-neutral-500 mt-1">Here&apos;s what&apos;s happening with your profile today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/worker/profile" className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">
            View Profile
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard icon={Briefcase} label="Completed Jobs" value={worker?.completedJobs || 0} colorClass="bg-primary-100 text-primary-600" />
        <StatCard icon={Star} label="Average Rating" value={worker?.rating ? worker.rating.toFixed(1) : '—'} colorClass="bg-accent-100 text-accent-600" />
        <StatCard icon={Clock} label="Response Time" value={worker?.responseTime || '—'} colorClass="bg-secondary-100 text-secondary-600" />
        <StatCard icon={CheckCircle} label="Active Bids" value={bids.filter((b) => b.status === 'pending').length} colorClass="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Proposals */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Active Proposals</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {bids.slice(0, 4).length > 0 ? bids.slice(0, 4).map((bid) => (
                <div key={bid._id} className="p-4 md:p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{bid.job?.title || 'Job'}</h4>
                    <p className="text-sm text-neutral-500 mt-1">{bid.job?.location?.city || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900">{bid.amount ? `${bid.amount.toLocaleString()} PKR` : '—'}</p>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      bid.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {bid.status || 'pending'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-neutral-400">No active proposals yet.</div>
              )}
            </div>
          </div>

          {/* Open Jobs */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Open Jobs Available</h2>
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">{openJobs.length} jobs</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {openJobs.length > 0 ? openJobs.map((job) => (
                <div key={job._id} className="p-4 md:p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-neutral-900 truncate">{job.title}</h4>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-neutral-400"><MapPin className="w-3 h-3" />{job.location?.city}{job.location?.area ? `, ${job.location.area}` : ''}</span>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><Tag className="w-3 h-3" />{job.budgetRange}</span>
                        <span className="text-xs text-amber-600 capitalize font-medium">{job.urgency}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openBidModal(job)}
                      disabled={alreadyBid(job._id)}
                      className="shrink-0 px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all shadow-sm shadow-primary-500/20"
                    >
                      {alreadyBid(job._id) ? 'Bid Sent' : 'Place Bid'}
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-sm text-neutral-400">No open jobs available yet. Check back soon.</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-primary-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-800 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold">Serviqo Pro Tips</h3>
              <p className="text-primary-100 text-sm mt-3 leading-relaxed">
                Profiles with more than 5 portfolio images get <span className="text-accent-400 font-bold">45% more job invitations</span>.
              </p>
              <Link href="/worker/portfolio" className="inline-block mt-6 px-5 py-2 bg-white text-primary-900 rounded-full text-sm font-bold hover:bg-primary-50 transition-colors">
                Add Photos
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Action Required</h2>
            </div>
            <div className="p-4 space-y-4">
              {worker && !worker.isVerified && (
                <div className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Identity verification</p>
                    <p className="text-xs text-neutral-600 mt-1">Upload your CNIC to unlock bidding on high-value jobs.</p>
                    <Link href="/worker/profile" className="text-xs font-bold text-red-500 mt-2 hover:underline block">Verify Now</Link>
                  </div>
                </div>
              )}
              <div className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-neutral-900">Update availability</p>
                  <p className="text-xs text-neutral-600 mt-1">Keep your schedule up to date to get more job matches.</p>
                  <Link href="/worker/availability" className="text-xs font-bold text-amber-700 mt-2 hover:underline block">Update Schedule</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {bidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Place a Bid</h2>
                <p className="text-sm text-neutral-500 mt-0.5 truncate max-w-xs">{bidModal.title}</p>
              </div>
              <button onClick={() => setBidModal(null)} className="p-2 hover:bg-neutral-100 rounded-xl">
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-neutral-50 rounded-2xl text-sm space-y-1">
                <p><span className="font-bold">Budget:</span> {bidModal.budgetRange}</p>
                <p><span className="font-bold">Location:</span> {bidModal.location?.area ? `${bidModal.location.area}, ` : ''}{bidModal.location?.city}</p>
                <p><span className="font-bold">Urgency:</span> <span className="capitalize">{bidModal.urgency}</span></p>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Your Bid Amount (PKR) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={bidForm.amount}
                  onChange={(e) => setBidForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Proposal / Cover Letter <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  value={bidForm.proposal}
                  onChange={(e) => setBidForm((p) => ({ ...p, proposal: e.target.value }))}
                  placeholder="Briefly describe your approach, relevant experience, and why you're the best fit..."
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-primary-500 transition-all resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-1">Estimated Days to Complete</label>
                <input
                  type="number"
                  value={bidForm.estimatedDays}
                  onChange={(e) => setBidForm((p) => ({ ...p, estimatedDays: e.target.value }))}
                  placeholder="e.g. 2"
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                />
              </div>

              {bidError && <p className="text-sm text-red-600 font-medium">{bidError}</p>}
              {bidSuccess && <p className="text-sm text-emerald-600 font-medium">{bidSuccess}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setBidModal(null)} className="px-6 py-2.5 text-neutral-600 font-bold hover:bg-neutral-50 rounded-xl transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleBidSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 disabled:bg-primary-300 transition-all shadow-lg shadow-primary-500/20"
                >
                  {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
