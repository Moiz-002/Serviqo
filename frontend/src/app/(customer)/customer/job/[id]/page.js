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
  Trash2,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import { getRealtimeSocket } from '@/lib/realtime';
import { useToast } from '@/components/ui/ToastProvider';

const STATUS_CONFIG = {
  open: { label: 'Open for Bids', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  active: { label: 'In Progress', color: 'bg-primary-100 text-primary-700 border-primary-200' },
  completed: { label: 'Completed', color: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200' },
};

function BidCard({ bid, jobId, jobStatus, acceptedBidId, onAccept, onReject, isActing }) {
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
                href={`/customer/messages?participantId=${encodeURIComponent(bid.worker?._id || '')}&jobId=${encodeURIComponent(jobId)}`}
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
                href={`/customer/messages?participantId=${encodeURIComponent(bid.worker?._id || '')}&jobId=${encodeURIComponent(jobId)}`}
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
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActing, setIsActing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [isManaging, setIsManaging] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);
  const [recommendationStatus, setRecommendationStatus] = useState('idle');
  const [recommendationError, setRecommendationError] = useState('');
  const [recommendationRetry, setRecommendationRetry] = useState(0);
  const [recommendationConsentJobId, setRecommendationConsentJobId] = useState('');
  const [feedbackSavingWorker, setFeedbackSavingWorker] = useState('');
  const [submittedRecommendationFeedback, setSubmittedRecommendationFeedback] = useState({});
  const { push: showToast } = useToast();
  const recommendationJobStatus = job?.status;
  const recommendationViewStatus = recommendationConsentJobId === id ? recommendationStatus : 'idle';

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

  useEffect(() => {
    if (recommendationJobStatus !== 'open' || recommendationConsentJobId !== id) return undefined;
    let isCurrent = true;
    api.getJobRecommendations(id)
      .then((data) => {
        if (!isCurrent) return;
        setRecommendationData(data);
        setRecommendationStatus('ready');
      })
      .catch((err) => {
        if (!isCurrent) return;
        setRecommendationError(err.message || 'Could not load recommendations.');
        setRecommendationStatus('error');
      });
    return () => {
      isCurrent = false;
    };
  }, [id, recommendationJobStatus, recommendationConsentJobId, recommendationRetry]);

  useEffect(() => {
    const socket = getRealtimeSocket();
    socket.emit('job:join', id);
    const onBidCreated = ({ jobId, bid: incomingBid, totalBids }) => {
      if (String(jobId) !== String(id)) return;
      setBids((current) => (
        current.some((bid) => bid._id === incomingBid._id) ? current : [incomingBid, ...current]
      ));
      setJob((current) => current ? { ...current, totalBids } : current);
    };
    const onJobStatus = ({ jobId, status }) => {
      if (String(jobId) === String(id)) setJob((current) => current ? { ...current, status } : current);
    };
    socket.on('bid:created', onBidCreated);
    socket.on('job:status', onJobStatus);
    return () => {
      socket.off('bid:created', onBidCreated);
      socket.off('job:status', onJobStatus);
    };
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

  const handleRecommendationFeedback = async (workerId, helpful) => {
    setFeedbackSavingWorker(workerId);
    try {
      await api.submitRecommendationFeedback(id, { workerId, helpful });
      setSubmittedRecommendationFeedback((current) => ({ ...current, [workerId]: helpful }));
      showToast('Thanks. Your recommendation feedback was saved.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to save recommendation feedback.', 'error');
    } finally {
      setFeedbackSavingWorker('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this open job request? This cannot be undone.')) return;
    setIsManaging(true);
    setActionMessage('');
    try {
      await api.deleteJob(id);
      router.push('/customer/my-jobs');
    } catch (err) {
      setActionMessage(err.message || 'Failed to delete the job.');
      setIsManaging(false);
    }
  };

  const handleComplete = async () => {
    setIsManaging(true);
    setActionMessage('');
    try {
      const data = await api.completeJob(id);
      setJob(data.job || data);
      setActionMessage('Job marked as completed.');
    } catch (err) {
      setActionMessage(err.message || 'Failed to complete the job.');
    } finally {
      setIsManaging(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!reviewRating) {
      showToast('Please choose a rating from 1 to 5 stars.', 'error');
      return;
    }
    if (reviewComment.trim().length > 2000) {
      showToast('Your review must be 2,000 characters or fewer.', 'error');
      return;
    }
    setIsReviewing(true);
    try {
      const data = await api.postReview({
        jobId: id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setJob((current) => current ? { ...current, review: data.review } : current);
      setReviewSubmitted(true);
      showToast('Thank you. Your rating and review were saved.', 'success');
    } catch (err) {
      showToast(err.message || 'Unable to save your review.', 'error');
    } finally {
      setIsReviewing(false);
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

          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-neutral-100">
            {job.status === 'open' && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isManaging}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Request
              </button>
            )}
            {job.status === 'active' && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isManaging}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Complete
              </button>
            )}
          </div>

          <p className="mt-4 text-neutral-600 leading-relaxed">{job.description}</p>

          {job.status === 'completed' && job.assignedWorker && !reviewSubmitted && (
            <form onSubmit={handleReviewSubmit} className="mt-8 rounded-2xl border border-primary/15 bg-primary-subtle/40 p-5 md:p-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-black text-text-primary">How was your experience?</h2>
                <p className="text-sm font-medium text-text-secondary">
                  Rate {job.assignedWorker.name || 'your professional'} and share feedback to help the Serviqo community.
                </p>
              </div>
              <fieldset className="mt-5">
                <legend className="text-sm font-bold text-text-primary">Your rating</legend>
                <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Worker rating">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      role="radio"
                      aria-checked={reviewRating === rating}
                      aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                      onClick={() => setReviewRating(rating)}
                      className="rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/15"
                    >
                      <Star className={`h-8 w-8 ${rating <= reviewRating ? 'fill-warning text-warning' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label htmlFor="job-review" className="mt-5 block text-sm font-bold text-text-primary">
                Review <span className="font-medium text-text-tertiary">(optional)</span>
              </label>
              <textarea
                id="job-review"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Tell the worker what went well..."
                className="mt-2 w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-text-tertiary">{reviewComment.length}/2000</span>
                <button
                  type="submit"
                  disabled={isReviewing || !reviewRating}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {isReviewing ? 'Saving...' : 'Submit Review'}
                </button>
              </div>
            </form>
          )}

          {job.status === 'completed' && (reviewSubmitted || job.review) && (
            <div className="mt-8 rounded-2xl border border-success/20 bg-success-light p-5">
              <h2 className="text-lg font-black text-text-primary">Review submitted</h2>
              <div className="mt-2 flex items-center gap-1" aria-label={`${job.review?.rating || reviewRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star key={rating} className={`h-5 w-5 ${rating <= (job.review?.rating || reviewRating) ? 'fill-warning text-warning' : 'text-neutral-300'}`} />
                ))}
              </div>
              {(job.review?.comment || reviewComment) && (
                <p className="mt-2 text-sm font-medium italic text-text-secondary">
                  &quot;{job.review?.comment || reviewComment}&quot;
                </p>
              )}
            </div>
          )}

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

      {job.status === 'open' && (
        <section className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm" aria-labelledby="worker-recommendations-heading">
          <div className="flex flex-col gap-3 border-b border-primary-50 bg-gradient-to-r from-primary-50/80 to-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary-100 p-2.5 text-primary-700">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="worker-recommendations-heading" className="text-lg font-black text-neutral-900">
                  Recommended professionals
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  AI-assisted matches ranked using this request and verified worker profiles. Match scores show relative fit, not a probability or guarantee.
                </p>
              </div>
            </div>
            {recommendationViewStatus === 'ready' && recommendationData?.analysisMode === 'gemini_hybrid' && (
              <span className="w-fit rounded-full border border-primary-100 bg-white px-3 py-1 text-xs font-bold text-primary-700">
                Gemini + profile matching
              </span>
            )}
          </div>

          {recommendationViewStatus === 'loading' && (
            <div className="flex items-center gap-3 p-6 text-sm font-medium text-neutral-600" role="status">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              Finding workers whose skills fit your request...
            </div>
          )}

          {recommendationViewStatus === 'idle' && (
            <div className="p-6">
              <p className="max-w-3xl text-sm leading-relaxed text-neutral-600">
                To find matches, Serviqo sends this job’s category and description plus de-identified Worker service and skill terms to Google Gemini. Common email, phone, and CNIC patterns are removed first; names, contact details, account IDs, ratings, and identity documents are not sent. Please do not include sensitive personal information in your job description.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRecommendationData(null);
                  setRecommendationError('');
                  setRecommendationStatus('loading');
                  setRecommendationConsentJobId(id);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl !bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-200"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Find recommended workers
              </button>
            </div>
          )}

          {recommendationViewStatus === 'error' && (
            <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <p className="text-sm text-neutral-600">{recommendationError}</p>
              <button
                type="button"
                onClick={() => {
                  setRecommendationError('');
                  setRecommendationStatus('loading');
                  setRecommendationRetry((attempt) => attempt + 1);
                }}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {recommendationViewStatus === 'ready' && (
            recommendationData?.recommendations?.length ? (
              <div className="divide-y divide-neutral-100">
                {recommendationData.recommendations.map(({ worker, score, reasons, feedback }) => {
                  const workerId = String(worker._id);
                  const submittedFeedback = submittedRecommendationFeedback[workerId];
                  return (
                    <article key={workerId} className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <img
                          src={worker.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name || 'W')}&background=1E3A8A&color=fff`}
                          alt=""
                          className="h-14 w-14 rounded-full border border-neutral-200 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <Link href={`/workers/${workerId}`} className="font-bold text-neutral-900 hover:text-primary-700 hover:underline">
                                {worker.name}
                              </Link>
                              <p className="mt-1 text-sm text-neutral-500">
                                {[worker.serviceCategory, worker.city].filter(Boolean).join(' · ')}
                              </p>
                            </div>
                            <div className="min-w-28 text-left sm:text-right">
                              <span className="text-lg font-black text-primary-700">{Math.round(score)}%</span>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Match score</p>
                            </div>
                          </div>

                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100" aria-label={`Match score ${Math.round(score)} percent`}>
                            <div className="h-full rounded-full bg-primary-500" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-600">
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                              {Number(worker.rating || 0).toFixed(1)} ({worker.totalReviews || 0} reviews)
                            </span>
                            <span>{worker.experience || 0} years’ experience</span>
                            <span>{worker.completedJobs || 0} completed jobs</span>
                            {worker.hourlyRate > 0 && <span>{worker.hourlyRate.toLocaleString()} PKR/hour</span>}
                          </div>

                          {Array.isArray(worker.skills) && worker.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {worker.skills.slice(0, 5).map((skill) => (
                                <span key={skill} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          {Array.isArray(reasons) && reasons.length > 0 && (
                            <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                              {reasons.map((reason) => <li key={reason}>• {reason}</li>)}
                            </ul>
                          )}

                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Link
                              href={`/workers/${workerId}`}
                              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700"
                            >
                              View profile
                            </Link>
                            <Link
                              href={`/customer/messages?participantId=${encodeURIComponent(workerId)}&jobId=${encodeURIComponent(id)}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 px-4 py-2 text-sm font-bold text-primary-700 transition hover:bg-primary-50"
                            >
                              <MessageSquare className="h-4 w-4" aria-hidden="true" />
                              Message worker
                            </Link>
                            <span className="ml-1 text-xs text-neutral-500">Was this recommendation useful?</span>
                            <button
                              type="button"
                              aria-label={`Mark ${worker.name}'s recommendation helpful`}
                              aria-pressed={submittedFeedback === true}
                              disabled={feedbackSavingWorker === workerId}
                              onClick={() => handleRecommendationFeedback(workerId, true)}
                              className={`rounded-lg p-2 transition disabled:opacity-50 ${submittedFeedback === true ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-500 hover:bg-neutral-100'}`}
                            >
                              <ThumbsUp className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Mark ${worker.name}'s recommendation not helpful`}
                              aria-pressed={submittedFeedback === false}
                              disabled={feedbackSavingWorker === workerId}
                              onClick={() => handleRecommendationFeedback(workerId, false)}
                              className={`rounded-lg p-2 transition disabled:opacity-50 ${submittedFeedback === false ? 'bg-red-50 text-red-700' : 'text-neutral-500 hover:bg-neutral-100'}`}
                            >
                              <ThumbsDown className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="text-[11px] text-neutral-400">
                              {feedback?.helpful || 0} helpful · {feedback?.notHelpful || 0} not helpful
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-sm text-neutral-600">
                No verified workers are available to recommend for this request yet. You can still review proposals as they arrive.
              </div>
            )
          )}
        </section>
      )}

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
                  jobId={id}
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
