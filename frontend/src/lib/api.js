// Use environment variable for API base so local/dev/prod can differ.
// Accept multiple env var names for backward compatibility.
const BASE = process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CLIENT_SESSION_COOKIE = 'serviqo_session';
const CLIENT_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function setClientSessionCookie(user) {
  if (typeof document === 'undefined' || !user?._id || !user?.role) return;

  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const cookieParts = [
    `${CLIENT_SESSION_COOKIE}=${encodeURIComponent(`${user.role}:${user._id}`)}`,
    'Path=/',
    `Max-Age=${CLIENT_SESSION_MAX_AGE}`,
    'SameSite=Lax',
  ];

  if (secure) {
    cookieParts.push('Secure');
  }

  document.cookie = cookieParts.join('; ');
}

function clearClientSessionCookie() {
  if (typeof document === 'undefined') return;

  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const cookieParts = [
    `${CLIENT_SESSION_COOKIE}=`,
    'Path=/',
    'Max-Age=0',
    'SameSite=Lax',
  ];

  if (secure) {
    cookieParts.push('Secure');
  }

  document.cookie = cookieParts.join('; ');
}

async function request(path, { headers: extraHeaders, body, ...rest } = {}) {
  const isFormData = body instanceof FormData;
  const headers = isFormData
    ? extraHeaders || {}
    : { 'Content-Type': 'application/json', ...(extraHeaders || {}) };

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers,
    body,
    ...rest,
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Auth
export const signup = (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) });
export const checkAvailability = (body) => request('/auth/check-availability', { method: 'POST', body: JSON.stringify(body) });
export const verifyOtp = async (body) => {
  const data = await request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });
  setClientSessionCookie(data.user);
  return data;
};
export const login = async (body) => {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  setClientSessionCookie(data.user);
  return data;
};
export const verifyAdminCredentials = (body) => request('/auth/admin-login/verify-credentials', { method: 'POST', body: JSON.stringify(body) });
export const adminLogin = async (body) => {
  const data = await request('/auth/admin-login', { method: 'POST', body: JSON.stringify(body) });
  setClientSessionCookie(data.user);
  return data;
};
export const requestLoginOtp = (body) => request('/auth/request-login-otp', { method: 'POST', body: JSON.stringify(body) });
export const verifyLoginOtp = async (body) => {
  const data = await request('/auth/verify-login-otp', { method: 'POST', body: JSON.stringify(body) });
  setClientSessionCookie(data.user);
  return data;
};
export const logout = async () => {
  try {
    return await request('/auth/logout', { method: 'POST' });
  } finally {
    clearClientSessionCookie();
  }
};
export const forgotPassword = (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) });
export const resetPassword = (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) });
export const resendOtp = (body) => request('/auth/resend-otp', { method: 'POST', body: JSON.stringify(body) });

// User
export const getMe = () => request('/user/me');
export const updateUserProfile = (formData) => request('/user/profile', { method: 'PUT', body: formData });

// Workers (public)
export const searchWorkers = (params = '') => request(`/workers?${params}`);
export const getWorkerPublicProfile = (workerId) => request(`/workers/${workerId}`);

// Worker (private)
export const getWorkerDashboard = () => request('/worker/dashboard');
export const updateWorkerProfile = (formData) => request('/worker/profile', { method: 'PUT', body: formData });
export const updateSkills = (body) => request('/worker/skills', { method: 'PUT', body: JSON.stringify(body) });
export const updateAvailability = (body) => request('/worker/availability', { method: 'PUT', body: JSON.stringify(body) });
export const addPortfolioItem = (formData) => request('/worker/portfolio', { method: 'POST', body: formData });
export const removePortfolioItem = (itemId) => request(`/worker/portfolio/${itemId}`, { method: 'DELETE' });
export const uploadCnic = (formData) => request('/worker/cnic', { method: 'POST', body: formData });

// Jobs
export const createJob = (formData) => request('/jobs', { method: 'POST', body: formData });
export const getJobs = () => request('/jobs');
export const getJobById = (id) => request(`/jobs/${id}`);
export const updateJob = (id, body) => request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteJob = (id) => request(`/jobs/${id}`, { method: 'DELETE' });
export const completeJob = (id) => request(`/jobs/${id}/complete`, { method: 'PATCH' });

// Bids
export const submitBid = (body) => request('/bids', { method: 'POST', body: JSON.stringify(body) });
export const getMyBids = () => request('/bids/mine');
export const getJobBids = (jobId) => request(`/bids/job/${jobId}`);
export const acceptBid = (bidId) => request(`/bids/${bidId}/accept`, { method: 'PUT' });
export const rejectBid = (bidId) => request(`/bids/${bidId}/reject`, { method: 'PUT' });

// Messages
export const getConversations = () => request('/messages/conversations');
export const getOrCreateConversation = (body) => request('/messages/conversations', { method: 'POST', body: JSON.stringify(body) });
export const getMessages = (conversationId) => request(`/messages/conversations/${conversationId}`);
export const sendMessage = (conversationId, body) => request(`/messages/conversations/${conversationId}`, { method: 'POST', body: JSON.stringify(body) });

// Reviews
export const postReview = (body) => request('/reviews', { method: 'POST', body: JSON.stringify(body) });
export const getWorkerReviews = (workerId) => request(`/reviews/worker/${workerId}`);
export const getMyReviews = () => request('/reviews/mine');

// Disputes
export const createDispute = (body) => request('/disputes', { method: 'POST', body: JSON.stringify(body) });
export const getMyDisputes = () => request('/disputes/mine');

// Admin
export const getAdminAnalytics = () => request('/admin/analytics');
export const getAdminUsers = (params = '') => request(`/admin/users?${params}`);
export const updateUserStatus = (userId, body) => request(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify(body) });
export const getAdminJobs = () => request('/admin/jobs');
export const getPendingVerifications = () => request('/admin/verifications');
export const approveVerification = (userId) => request(`/admin/verifications/${userId}/approve`, { method: 'PUT' });
export const rejectVerification = (userId, body) => request(`/admin/verifications/${userId}/reject`, { method: 'PUT', body: JSON.stringify(body) });
export const getAdminDisputes = () => request('/admin/disputes');
export const resolveDispute = (disputeId, body) => request(`/admin/disputes/${disputeId}/resolve`, { method: 'PUT', body: JSON.stringify(body) });

const CLOUDINARY_CLOUD =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD ||
  process.env.NEXT_PUBLIC_CLOUDINARY_NAME ||
  process.env.CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUD;

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  // Legacy paths stored Cloudinary public IDs (serviqo/<folder>/<id>),
  // sometimes erroneously prefixed with /uploads/jobs/. Extract the public ID
  // and rebuild the Cloudinary URL.
  const serviqoIdx = path.indexOf('serviqo/');
  if (serviqoIdx !== -1) {
    if (CLOUDINARY_CLOUD) {
      const publicId = path.slice(serviqoIdx);
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${publicId}`;
    }
    // Cloud name not configured for client — fallback to returning stored path
    // (could be a public id which cannot be resolved without cloud name).
    // Warn so devs notice misconfiguration.
    // eslint-disable-next-line no-console
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set — cannot construct Cloudinary URL for', path);
    return path;
  }

  if (path.startsWith('/uploads')) {
    // If uploads stored locally, point to the server origin. If BASE contains /api,
    // strip it so `/uploads/...` maps to the server origin + path.
    return `${BASE.replace(/\/api\/?$/, '')}${path}`;
  }

  return path;
};
