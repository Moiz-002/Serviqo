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
                      className="shrink-0 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all shadow-sm shadow-primary-500/20"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-navy-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-neutral-200/50"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight">Place Professional Bid</h2>
                  <p className="text-sm text-neutral-500 font-medium mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                    {bidModal.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setBidModal(null)} 
                className="p-3 hover:bg-neutral-200/50 rounded-2xl transition-colors group"
                aria-label="Close modal"
              >
                <X className="w-6 h-6 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-8">
                {/* Job Context Card */}
                <div className="p-6 bg-primary-900 text-white rounded-3xl relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10 grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Client Budget</p>
                      <p className="text-primary text-lg font-bold mt-1 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-accent" />
                        {bidModal.budgetRange}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Location</p>
                      <p className="text-primary text-lg font-bold mt-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        {bidModal.location?.city}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-neutral-900 uppercase tracking-widest ml-1">
                      Your Bid Amount (PKR) <span className="text-error">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors font-black text-lg">₨</div>
                      <input
                        type="number"
                        value={bidForm.amount}
                        onChange={(e) => setBidForm((p) => ({ ...p, amount: e.target.value }))}
                        placeholder="0.00"
                        className="w-full pl-12 pr-6 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-black text-lg placeholder:text-neutral-300"
                      />
                    </div>
                  </div>

                  {/* Estimated Days */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-neutral-900 uppercase tracking-widest ml-1">
                      Completion Time (Days)
                    </label>
                    <div className="relative group">
                      <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="number"
                        value={bidForm.estimatedDays}
                        onChange={(e) => setBidForm((p) => ({ ...p, estimatedDays: e.target.value }))}
                        placeholder="e.g. 3"
                        className="w-full pl-12 pr-6 py-4 bg-neutral-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-primary focus:bg-white transition-all font-bold placeholder:text-neutral-300"
                      />
                    </div>
                  </div>

                  {/* Proposal Textarea */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-neutral-900 uppercase tracking-widest ml-1">
                      Professional Proposal <span className="text-error">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={bidForm.proposal}
                      onChange={(e) => setBidForm((p) => ({ ...p, proposal: e.target.value }))}
                      placeholder="Describe your expertise, approach, and why the client should choose you..."
                      className="w-full px-6 py-5 bg-neutral-50 border-2 border-neutral-100 rounded-3xl outline-none focus:border-primary focus:bg-white transition-all resize-none text-neutral-700 font-medium leading-relaxed placeholder:text-neutral-300"
                    />
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider ml-1">
                      Pro tip: Detailed proposals increase hire rate by 60%
                    </p>
                  </div>
                </div>

                {bidError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-700 font-bold">{bidError}</p>
                  </div>
                )}
                
                {bidSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <p className="text-sm text-emerald-700 font-bold">{bidSuccess}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-8 border-t border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
              <button 
                onClick={() => setBidModal(null)} 
                className="px-8 py-4 text-neutral-500 font-black uppercase tracking-widest hover:bg-neutral-100 rounded-2xl transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBidSubmit}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-3 px-12 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-hover disabled:opacity-50 transition-all shadow-xl shadow-primary/20 text-xs group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Bid
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
