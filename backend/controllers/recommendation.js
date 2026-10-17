const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const RecommendationFeedback = require('../models/RecommendationFeedback');

const MAX_CANDIDATES = 100;
const RECOMMENDATION_LIMIT = 10;

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
  const timeout = setTimeout(() => controller.abort(), 45_000);
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
    console.error('Worker recommendation request failed:', timedOut ? 'service timeout' : error.message);
    const status = error.status === 503 ? 503 : 502;
    return res.status(status).json({
      error: timedOut
        ? 'Recommendations took too long to generate. Please try again.'
        : 'Recommendations are temporarily unavailable. Please try again.',
    });
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

module.exports = { getJobRecommendations, submitRecommendationFeedback };
