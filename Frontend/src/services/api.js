import axios from 'axios'

const API_BASE = 'http://localhost:8080/api'

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

export default api
