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
    let url = '';
    // Only send status if it is a valid backend status value
    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
        url += `?status=${status}`;
    }
    return Historyapi.get(url, { headers: { 'X-User-Role': role, 'X-User-Id': userId } }).then(res => res.data);
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

// ─── Auth endpoints (Member 4) ───
export const authApi = {
    // POST /api/auth/register
    register: (userData) => api.post('/auth/register', userData),

    // POST /api/auth/login
    login: (credentials) => api.post('/auth/login', credentials),
};

export default Historyapi