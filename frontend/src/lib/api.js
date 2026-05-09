const BASE = 'http://localhost:5000/api';

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
export const verifyOtp = (body) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });
export const login = (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
export const verifyAdminCredentials = (body) => request('/auth/admin-login/verify-credentials', { method: 'POST', body: JSON.stringify(body) });
export const adminLogin = (body) => request('/auth/admin-login', { method: 'POST', body: JSON.stringify(body) });
export const requestLoginOtp = (body) => request('/auth/request-login-otp', { method: 'POST', body: JSON.stringify(body) });
export const verifyLoginOtp = (body) => request('/auth/verify-login-otp', { method: 'POST', body: JSON.stringify(body) });
export const logout = () => request('/auth/logout', { method: 'POST' });
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

/**
 * Robust helper to resolve image URLs.
 * Handles: 
 * 1. Absolute URLs (Cloudinary)
 * 2. Local backend paths (/uploads/...)
 * 3. Broken/Legacy paths (/uploads/jobs/serviqo/...)
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL (Cloudinary), return as is
  if (path.startsWith('http')) return path;
  
  // Handle legacy broken paths that incorrectly included 'serviqo/jobs' 
  // but were prefixed with /uploads/jobs/
  if (path.includes('serviqo/')) {
    // These are likely Cloudinary public IDs that were saved incorrectly.
    // If they don't start with http, they are broken.
    // Best we can do is try to point them to the backend or return null if totally invalid.
    return `${BASE.replace('/api', '')}${path}`;
  }

  // If it's a relative path starting with /uploads, point to backend
  if (path.startsWith('/uploads')) {
    return `${BASE.replace('/api', '')}${path}`;
  }

  // Fallback
  return path;
};
