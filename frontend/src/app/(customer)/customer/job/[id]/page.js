'use client';

import React, { useState, useEffect, use } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Tag,
  Star,
  CheckCircle2,
  XCircle,
  Briefcase,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import * as api from '@/lib/api';

const STATUS_CONFIG = {
  open: { label: 'Open for Bids', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  active: { label: 'In Progress', color: 'bg-primary-100 text-primary-700 border-primary-200' },
  completed: { label: 'Completed', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
};

function BidCard({ bid, jobStatus, acceptedBidId, onAccept, onReject, isActing }) {
  const isAccepted = acceptedBidId && bid._id === acceptedBidId;
  const isRejected = bid.status === 'rejected';
  const isPending = bid.status === 'pending';
  const canAct = jobStatus === 'open' && isPending && !isActing;

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isAccepted ? 'bg-emerald-50 border-emerald-200 shadow-sm' :
      isRejected ? 'bg-neutral-50 border-neutral-200 opacity-60' :
      'bg-white border-neutral-200 hover:border-primary-200 hover:shadow-sm'
    }`}>
      <div className="flex items-start gap-4">
        <img
          src={bid.worker?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(bid.worker?.name || 'W')}&background=1E3A8A&color=fff`}
          alt={bid.worker?.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-neutral-100 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h4 className="font-bold text-neutral-900">{bid.worker?.name || 'Worker'}</h4>
              <p className="text-xs text-neutral-500 mt-0.5">{bid.worker?.serviceCategory || bid.worker?.city || ''}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isAccepted && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hired
                </span>
              )}
              {isRejected && (
                <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">Declined</span>
              )}
              {isPending && !isAccepted && (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Pending</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-bold text-neutral-700">{bid.worker?.rating?.toFixed(1) || '—'}</span>
              <span className="text-xs text-neutral-400">({bid.worker?.completedJobs || 0} jobs)</span>
            </div>
            {bid.estimatedDays && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                {bid.estimatedDays} day{bid.estimatedDays !== 1 ? 's' : ''}
              </div>
            )}
            <div className="text-lg font-black text-primary-700">
              {bid.amount?.toLocaleString()} PKR
            </div>
          </div>

          {bid.proposal && (
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
              {bid.proposal}
            </p>
          )}

          {canAct && (
            <div className="flex gap-3 mt-4 pt-4 border-t border-neutral-100">
              <button
                onClick={() => onAccept(bid._id)}
                disabled={isActing}
                className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 disabled:bg-primary-300 transition-all shadow-sm shadow-primary-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept & Hire
              </button>
              <button
                onClick={() => onReject(bid._id)}
                disabled={isActing}
                className="flex items-center gap-2 px-5 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-600 disabled:opacity-50 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
              <Link
                href={`/customer/messages`}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-50 border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold hover:bg-neutral-100 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Link>
            </div>
          )}

          {isAccepted && (
            <div className="flex gap-3 mt-4 pt-4 border-t border-emerald-100">
              <Link
                href={`/customer/messages`}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Chat with Worker
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPage({ params }) {
  const { id } = use(params);
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActing, setIsActing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [jobData, bidsData] = await Promise.all([
          api.getJobById(id),
          api.getJobBids(id),
        ]);
        setJob(jobData.job || jobData);
        setBids(bidsData.bids || []);
      } catch (err) {
        setError(err.message || 'Failed to load job details.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAccept = async (bidId) => {
    setIsActing(true);
    setActionMessage('');
    try {
      await api.acceptBid(bidId);
      setActionMessage('Bid accepted! The worker has been hired.');
      const [jobData, bidsData] = await Promise.all([
        api.getJobById(id),
        api.getJobBids(id),
      ]);
      setJob(jobData.job || jobData);
      setBids(bidsData.bids || []);
    } catch (err) {
      setActionMessage(err.message || 'Failed to accept bid.');
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async (bidId) => {
    setIsActing(true);
    setActionMessage('');
    try {
      await api.rejectBid(bidId);
      const bidsData = await api.getJobBids(id);
      setBids(bidsData.bids || []);
    } catch (err) {
      setActionMessage(err.message || 'Failed to decline bid.');
    } finally {
      setIsActing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-neutral-400 text-sm">
        Loading job details...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <p className="text-neutral-600">{error || 'Job not found.'}</p>
        <Link href="/customer/my-jobs" className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to My Jobs
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.open;
  const pendingBids = bids.filter((b) => b.status === 'pending');
  const acceptedBidId = job.acceptedBid?._id || job.acceptedBid;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back */}
      <Link href="/customer/my-jobs" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-800 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Jobs
      </Link>

      {/* Job Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {job.images?.[0] && (
          <div className="h-48 w-full overflow-hidden">
            <img src={api.getImageUrl(job.images[0])} alt={job.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{job.category}</p>
              <h1 className="text-2xl font-black text-neutral-900">{job.title}</h1>
            </div>
            <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          <p className="mt-4 text-neutral-600 leading-relaxed">{job.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="font-medium">
                {job.location?.area ? `${job.location.area}, ` : ''}{job.location?.city}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Tag className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="font-medium">{job.budgetRange}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="font-medium capitalize">{job.urgency}</span>
            </div>
          </div>

          {job.images?.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {job.images.map((img, i) => (
                <img key={i} src={api.getImageUrl(img)} alt={`Photo ${i + 1}`} className="w-20 h-20 rounded-xl object-cover shrink-0 border border-neutral-200" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action message */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
          actionMessage.includes('accepted') || actionMessage.includes('hired')
            ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
            : 'bg-red-50 border border-red-100 text-red-700'
        }`}>
          {actionMessage.includes('accepted') || actionMessage.includes('hired')
            ? <CheckCircle2 className="w-5 h-5 shrink-0" />
            : <AlertCircle className="w-5 h-5 shrink-0" />
          }
          {actionMessage}
        </div>
      )}

      {/* Bids Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            Proposals Received
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
              {bids.length} total
            </span>
            {pendingBids.length > 0 && job.status === 'open' && (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full animate-pulse">
                {pendingBids.length} pending
              </span>
            )}
          </div>
        </div>

        {bids.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-neutral-300" />
            </div>
            <p className="text-neutral-500 font-medium">No proposals yet.</p>
            <p className="text-sm text-neutral-400">Workers will bid on your job soon. Check back later.</p>
          </div>
        ) : (
          <div className="p-4 md:p-6 space-y-4">
            {/* Show accepted bid first */}
            {bids
              .slice()
              .sort((a, b) => {
                if (a._id === acceptedBidId) return -1;
                if (b._id === acceptedBidId) return 1;
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (b.status === 'pending' && a.status !== 'pending') return 1;
                return 0;
              })
              .map((bid) => (
                <BidCard
                  key={bid._id}
                  bid={bid}
                  jobStatus={job.status}
                  acceptedBidId={acceptedBidId}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isActing={isActing}
                />
              ))
            }
          </div>
        )}
      </div>

      {/* Job Active Notice */}
      {job.status === 'active' && (
        <div className="p-5 bg-primary-50 border border-primary-100 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-primary-100 rounded-xl shrink-0">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">Worker Hired</p>
            <p className="text-sm text-neutral-600 mt-1">
              A worker has been hired for this job. Use the chat to coordinate and track progress.
            </p>
            <Link href="/customer/messages" className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 mt-3 hover:underline">
              Open Messages <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
