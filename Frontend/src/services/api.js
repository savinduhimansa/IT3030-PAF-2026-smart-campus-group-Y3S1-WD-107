import axios from 'axios'

// Use Vite dev proxy in development (see vite.config.js). For production, you can
// set VITE_API_BASE_URL (e.g. https://api.example.com/api).
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ─── Resource endpoints ───

export const resourceApi = {
    // GET /api/resources  (with optional filters)
    getAll: (params = {}) => {
        // Clean out empty/null params before sending
        const cleanParams = {}
        Object.entries(params).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                cleanParams[key] = value
            }
        })
        return api.get('/resources', { params: cleanParams })
    },

    // GET /api/resources/:id
    getById: (resourceId) => api.get(`/resources/${resourceId}`),

    // POST /api/resources
    create: (data) => api.post('/resources', data),

    // PUT /api/resources/:id
    update: (resourceId, data) => api.put(`/resources/${resourceId}`, data),

    // DELETE /api/resources/:id
    delete: (resourceId) => api.delete(`/resources/${resourceId}`),
}

// ─── Feedback endpoints ───

export const feedbackApi = {
    // GET /api/feedback/all
    getAll: () => api.get('/feedback/all'),

    // DELETE /api/feedback/:id
    delete: (feedbackId) => api.delete(`/feedback/${feedbackId}`),
}

// Get booking history (audit trail)
export const getBookingHistory = (bookingId) =>
    Historyapi.get(`/${bookingId}/history`).then((res) => res.data);

const Historyapi = axios.create({
    baseURL: `${API_BASE}/bookings`
});

export const getMyBookings = (userId) => Historyapi.get('/my', { headers: { 'X-User-Id': userId } }).then(res => res.data);
export const createBooking = (userId, data) => Historyapi.post('', data, { headers: { 'X-User-Id': userId } }).then(res => res.data);
export const cancelBooking = (userId, id) => Historyapi.post(`/${id}/cancel`, {}, { headers: { 'X-User-Id': userId } }).then(res => res.data);

export const getAllBookings = (userId, role, status) => {
    // Use Axios `params` instead of manual `?status=` string building.
    // This avoids generating `/bookings/?status=...` which can 404 on Spring (trailing slash).
    const normalizedStatus = typeof status === 'string' ? status.trim().toUpperCase() : null;
    const params = {};
    if (normalizedStatus && ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(normalizedStatus)) {
        params.status = normalizedStatus;
    }

    return Historyapi.get('', {
        params,
        headers: { 'X-User-Role': role, 'X-User-Id': userId },
    }).then(res => res.data);
};
// Approve booking: requires both X-User-Role and X-User-Id headers, no body
export const approveBooking = (role, userId, id) =>
    Historyapi.post(`/${id}/approve`, null, { headers: { 'X-User-Role': role, 'X-User-Id': userId } }).then(res => res.data);

// Reject booking: requires both X-User-Role and X-User-Id headers, body { reason }
export const rejectBooking = (role, userId, id, reason) =>
    Historyapi.post(`/${id}/reject`, { reason }, { headers: { 'X-User-Role': role, 'X-User-Id': userId } }).then(res => res.data);

// New: Update booking (PUT)
export const updateBooking = (userId, id, data) =>
    Historyapi.put(`/${id}`, data, { headers: { 'X-User-Id': userId } }).then(res => res.data);

// New: Delete booking (DELETE)
export const deleteBooking = (role, id) =>
    Historyapi.delete(`/${id}`, { headers: { 'X-User-Role': role } });

// ─── Availability endpoints ───
export const getBookedSlots = (resourceId, date) =>
    Historyapi.get('/booked-slots', { params: { resourceId, date } }).then(res => res.data);

export const getFreeSlots = (resourceId, date) =>
    Historyapi.get('/free-slots', { params: { resourceId, date } }).then(res => res.data);

export const checkAvailability = (resourceId, date, startTime, endTime) =>
    Historyapi.get('/availability', { params: { resourceId, date, startTime, endTime } }).then(res => res.data);

// ─── Auth & User Management endpoints (Member 4) ───
// Public: Verify booking by QR token (NO auth headers)
export const verifyBooking = async (token) => {
    const response = await axios.get(`/api/bookings/verify/${token}`);
    return response.data;
};

// ─── Auth endpoints (Member 4) ───
export const authApi = {
    // POST /api/auth/register
    register: (userData) => api.post('/auth/register', userData),

    // POST /api/auth/login
    login: (credentials) => api.post('/auth/login', credentials),

    // POST /api/auth/google
    googleLogin: (data) => api.post('/auth/google', data),

    // POST /api/auth/github (Added for OAuth Improvements)
    githubLogin: (data) => api.post('/auth/github', data),

    // GET /api/auth/all (Admin only - fetch all users)
    getAllUsers: () => api.get('/auth/all'),

    // PUT /api/auth/:id (Admin only - update user details like role)
    updateUser: (userId, userData) => api.put(`/auth/${userId}`, userData),

    // DELETE /api/auth/:id (Admin only - delete a user)
    deleteUser: (userId) => api.delete(`/auth/${userId}`),
};

// ─── Notification endpoints (Member 4) ───
export const notificationApi = {
    // GET /api/notifications/user/:userId
    getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),

    // GET /api/notifications/unread-count/:userId
    getUnreadCount: (userId) => api.get(`/notifications/unread-count/${userId}`),

    // PUT /api/notifications/:notificationId/read
    markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
};

export default Historyapi