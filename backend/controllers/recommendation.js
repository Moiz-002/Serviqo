const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const RecommendationFeedback = require('../models/RecommendationFeedback');
const RecommendationInvite = require('../models/RecommendationInvite');
const Bid = require('../models/Bid');
const { notifySafely } = require('../services/realtime');

const MAX_CANDIDATES = 100;
const RECOMMENDATION_LIMIT = 10;
const RECOMMENDATION_TIMEOUT_MS = 45_000;
const GENERIC_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'for', 'in', 'is', 'of', 'on', 'or', 'the', 'to', 'with',
  'installation', 'repair', 'service', 'cleaning', 'maintenance',
]);

function getContentTokens(value) {
  return new Set(
    String(value || '').toLowerCase().match(/[a-z0-9+#.-]+/g) || [],
  );
}

function candidateTokens(worker) {
  return getContentTokens([worker.serviceCategory, ...(worker.skills || [])].join(' '));
}

function buildKeywordFallback(job, candidates, feedback) {
  const jobText = `${job.title} ${job.description}`;
  const jobTokens = new Set([...getContentTokens(jobText)].filter((token) => !GENERIC_WORDS.has(token)));
  const requiredSkills = [];
  for (const worker of candidates) {
    for (const skill of worker.skills || []) {
      const skillTokens = [...getContentTokens(skill)].filter((token) => !GENERIC_WORDS.has(token));
      if (skillTokens.length && skillTokens.every((token) => jobTokens.has(token)) && !requiredSkills.includes(skill)) {
        requiredSkills.push(skill);
        if (requiredSkills.length === 12) break;
      }
    }
    if (requiredSkills.length === 12) break;
  }
  const requiredTokens = new Set(requiredSkills.flatMap((skill) => [...getContentTokens(skill)]));
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Karachi',
  }).format(new Date()).toLowerCase();
  const urgency = String(job.urgency || '').toLowerCase();

  const recommendations = candidates.map((worker) => {
    const tokens = candidateTokens(worker);
    const intersection = [...jobTokens].filter((token) => tokens.has(token));
    const unionSize = new Set([...jobTokens, ...tokens]).size;
    const semantic = unionSize ? intersection.length / unionSize : 0;
    const categoryMatch = Number(
      String(worker.serviceCategory || '').trim().toLowerCase()
      === String(job.category || '').trim().toLowerCase(),
    );
    const skillTokens = new Set((worker.skills || []).flatMap((skill) => [...getContentTokens(skill)]));
    const matchedTerms = [...requiredTokens].filter((token) => skillTokens.has(token)).slice(0, 3);
    const lexical = requiredTokens.size ? matchedTerms.length / requiredTokens.size : 0;
    const locationMatch = Number(
      Boolean(job.location?.city)
      && String(worker.city || '').trim().toLowerCase() === String(job.location.city).trim().toLowerCase(),
    );
    const availableDays = Object.entries(worker.availability || {})
      .filter(([, schedule]) => schedule && schedule.available === true)
      .map(([day]) => day.toLowerCase());
    let availability = 0.5;
    if (Object.keys(worker.availability || {}).length) {
      if (urgency.includes('today')) availability = Number(availableDays.includes(weekday));
      else if (['urgent', 'asap', 'immediate'].some((term) => urgency.includes(term))) {
        availability = Number(availableDays.length > 0);
      } else availability = Math.min(availableDays.length / 3, 1);
    }
    const experience = Math.min(Number(worker.experience || 0) / 10, 1);
    const reviews = Number(worker.totalReviews || 0);
    const rating = Number(worker.rating || 0);
    const ratingConfidence = Math.min(reviews / 5, 1) * (rating / 5);
    const workerFeedback = feedback.get(String(worker._id));
    const positive = workerFeedback?.positiveFeedback || 0;
    const negative = workerFeedback?.negativeFeedback || 0;
    const feedbackTotal = positive + negative;
    const feedbackScore = feedbackTotal ? (positive + 1) / (feedbackTotal + 2) : 0.5;
    const score = (
      categoryMatch * 0.22
      + semantic * 0.28
      + lexical * 0.15
      + locationMatch * 0.12
      + availability * 0.10
      + experience * 0.07
      + ratingConfidence * 0.03
      + feedbackScore * 0.03
    );
    const reasons = [];
    if (categoryMatch) reasons.push(`Offers the requested ${job.category} service`);
    if (matchedTerms.length) reasons.push(`Skills match: ${matchedTerms.join(', ')}`);
    else if (semantic >= 0.65) reasons.push('Worker skills are relevant to the request');
    if (locationMatch) reasons.push(`Located in ${job.location.city}`);
    if (reviews >= 3 && rating >= 4) reasons.push(`Rated ${rating.toFixed(1)}/5 from ${reviews} reviews`);

    return {
      workerId: String(worker._id),
      score: Math.round(score * 1000) / 10,
      reasons: reasons.slice(0, 4),
    };
  });
  recommendations.sort((left, right) => right.score - left.score || left.workerId.localeCompare(right.workerId));
  return {
    analysisMode: 'keyword_fallback',
    requiredSkills,
    recommendations: recommendations.slice(0, RECOMMENDATION_LIMIT),
  };
}

function pythonServiceUrl() {
  const baseUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error('AI_SERVICE_URL must be a valid URL');
  }
  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  if (!localHosts.has(parsed.hostname) && !process.env.AI_SERVICE_TOKEN) {
    throw new Error('AI_SERVICE_TOKEN is required when the AI service is not local');
  }
  return `${baseUrl.replace(/\/+$/, '')}/v1/recommendations`;
}

async function requestRecommendations(job, candidates, feedback) {
  const url = pythonServiceUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RECOMMENDATION_TIMEOUT_MS);
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.AI_SERVICE_TOKEN) {
    headers.Authorization = `Bearer ${process.env.AI_SERVICE_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        job: {
          title: job.title,
          description: job.description,
          category: job.category,
          city: job.location?.city || '',
          urgency: job.urgency || '',
        },
        candidates: candidates.map((worker) => ({
          id: String(worker._id),
          serviceCategory: worker.serviceCategory || '',
          skills: worker.skills || [],
          city: worker.city || '',
          availability: worker.availability || {},
          experience: worker.experience || 0,
          rating: worker.rating || 0,
          totalReviews: worker.totalReviews || 0,
          completedJobs: worker.completedJobs || 0,
          positiveFeedback: feedback.get(String(worker._id))?.positiveFeedback || 0,
          negativeFeedback: feedback.get(String(worker._id))?.negativeFeedback || 0,
        })),
        limit: RECOMMENDATION_LIMIT,
      }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = typeof body?.detail === 'string' ? body.detail : 'Recommendation service returned an error';
      const error = new Error(detail);
      error.status = response.status;
      throw error;
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function getJobRecommendations(req, res) {
  const { jobId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ error: 'Invalid job ID' });
  }

  const job = await Job.findOne({
    _id: jobId,
    customer: req.user._id,
    status: 'open',
  }).select('title description category location urgency');
  if (!job) return res.status(404).json({ error: 'Open job not found' });

  const candidates = await User.find({
    role: 'worker',
    isActive: true,
    isVerified: true,
    cnicVerified: true,
    serviceCategory: job.category,
  })
    .select('name profilePicture serviceCategory city skills experience hourlyRate availability rating totalReviews completedJobs portfolio')
    .sort({ rating: -1, completedJobs: -1 })
    .limit(MAX_CANDIDATES)
    .lean();

  if (!candidates.length) {
    return res.json({
      analysisMode: 'no_candidates',
      requiredSkills: [],
      recommendations: [],
    });
  }

  const workerIds = candidates.map((worker) => worker._id);
  const feedbackRows = await RecommendationFeedback.aggregate([
    { $match: { worker: { $in: workerIds }, category: job.category } },
    {
      $group: {
        _id: '$worker',
        positiveFeedback: { $sum: { $cond: ['$helpful', 1, 0] } },
        negativeFeedback: { $sum: { $cond: ['$helpful', 0, 1] } },
      },
    },
  ]);
  const feedback = new Map(feedbackRows.map((row) => [String(row._id), row]));

  let result;
  try {
    result = await requestRecommendations(job, candidates, feedback);
  } catch (error) {
    const timedOut = error.name === 'AbortError';
    console.warn(
      'Worker recommendation service unavailable; using local keyword matching:',
      timedOut ? 'request timed out' : error.message,
    );
    result = buildKeywordFallback(job, candidates, feedback);
  }

  const candidateById = new Map(candidates.map((worker) => [String(worker._id), worker]));
  const seen = new Set();
  const recommendations = (Array.isArray(result.recommendations) ? result.recommendations : [])
    .filter((item) => {
      const id = String(item.workerId || '');
      if (!candidateById.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((item) => {
      const worker = candidateById.get(String(item.workerId));
      return {
        worker: {
          _id: worker._id,
          name: worker.name,
          profilePicture: worker.profilePicture,
          serviceCategory: worker.serviceCategory,
          city: worker.city,
          skills: worker.skills,
          experience: worker.experience,
          hourlyRate: worker.hourlyRate,
          availability: worker.availability,
          rating: worker.rating,
          totalReviews: worker.totalReviews,
          completedJobs: worker.completedJobs,
          portfolio: worker.portfolio,
        },
        score: Number.isFinite(item.score) ? Math.max(0, Math.min(100, item.score)) : 0,
        reasons: Array.isArray(item.reasons)
          ? item.reasons.filter((reason) => typeof reason === 'string').slice(0, 4)
          : [],
        feedback: {
          helpful: feedback.get(String(worker._id))?.positiveFeedback || 0,
          notHelpful: feedback.get(String(worker._id))?.negativeFeedback || 0,
        },
      };
    });
  const invitedWorkers = recommendations.length
    ? await RecommendationInvite.find({
      job: job._id,
      worker: { $in: recommendations.map((item) => item.worker._id) },
    }).select('worker').lean()
    : [];
  const invitedIds = new Set(invitedWorkers.map((invite) => String(invite.worker)));
  recommendations.forEach((item) => {
    item.invited = invitedIds.has(String(item.worker._id));
  });

  return res.json({
    analysisMode: result.analysisMode,
    requiredSkills: Array.isArray(result.requiredSkills) ? result.requiredSkills : [],
    recommendations,
  });
}

async function submitRecommendationFeedback(req, res) {
  const { jobId } = req.params;
  const { workerId, helpful } = req.body;
  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(workerId)) {
    return res.status(400).json({ error: 'A valid job ID and worker ID are required' });
  }
  if (typeof helpful !== 'boolean') {
    return res.status(400).json({ error: 'Helpful feedback must be true or false' });
  }

  const job = await Job.findOne({ _id: jobId, customer: req.user._id }).select('_id category');
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const worker = await User.findOne({ _id: workerId, role: 'worker' }).select('_id');
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  await RecommendationFeedback.findOneAndUpdate(
    { job: job._id, customer: req.user._id, worker: worker._id },
    { $set: { category: job.category, helpful } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  return res.json({ message: 'Recommendation feedback recorded' });
}

async function inviteRecommendedWorker(req, res) {
  const { jobId } = req.params;
  const { workerId } = req.body || {};
  if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(workerId)) {
    return res.status(400).json({ error: 'A valid job ID and worker ID are required' });
  }

  const job = await Job.findOne({
    _id: jobId,
    customer: req.user._id,
    status: 'open',
  }).select('_id title category');
  if (!job) return res.status(404).json({ error: 'Open job not found' });

  const worker = await User.findOne({
    _id: workerId,
    role: 'worker',
    isActive: true,
    isVerified: true,
    cnicVerified: true,
    serviceCategory: job.category,
  }).select('_id');
  if (!worker) return res.status(404).json({ error: 'Worker not found' });

  if (await RecommendationInvite.findOne({ job: job._id, worker: worker._id })) {
    return res.status(409).json({ error: 'Worker already invited to this job' });
  }
  if (await Bid.findOne({ job: job._id, worker: worker._id })) {
    return res.status(409).json({ error: 'Worker has already bid on this job' });
  }
  if (await RecommendationInvite.countDocuments({ job: job._id }) >= 10) {
    return res.status(429).json({ error: 'Maximum invitations reached for this job' });
  }

  try {
    await RecommendationInvite.create({
      job: job._id,
      customer: req.user._id,
      worker: worker._id,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Worker already invited to this job' });
    }
    throw error;
  }

  await notifySafely(worker._id, {
    type: 'job_invite',
    title: 'You are invited to bid',
    message: `${req.user.name} invited you to bid on "${job.title}".`,
    href: `/worker/jobs/${job._id}`,
  });
  return res.status(201).json({ message: 'Invitation sent' });
}

module.exports = { getJobRecommendations, submitRecommendationFeedback, inviteRecommendedWorker };
