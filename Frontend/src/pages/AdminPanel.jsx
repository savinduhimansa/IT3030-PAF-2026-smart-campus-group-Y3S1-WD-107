import { useState, useEffect } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ListFilter,
  MapPin,
  Users,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { RESOURCE_TYPES, STATUSES, getTypeInfo, getStatusInfo } from '../constants'
import { resourceApi } from '../services/api'

const emptyForm = {
  name: '',
  type: 'LECTURE_HALL',
  capacity: '',
  location: '',
  status: 'ACTIVE',
  description: '',
  availableFrom: '08:00',
  availableTo: '18:00',
  isBookable: true,
}

export default function AdminPanel() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [tableFilter, setTableFilter] = useState('')

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await resourceApi.getAll()
      setResources(response.data)
    } catch (err) {
      console.error('Failed to fetch resources:', err)
      setError(err.response?.data?.message || 'Failed to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target
    if (inputType === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: e.target.checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim() || !form.capacity || !form.location.trim()) {
      showToast('⚠️ Please fill in all required fields')
      return
    }

    // Build the request body matching ResourceRequest DTO
    const requestBody = {
      name: form.name.trim(),
      type: form.type,
      capacity: parseInt(form.capacity),
      location: form.location.trim(),
      description: form.description.trim() || null,
      status: form.status,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo,
      isBookable: form.isBookable,
    }

    try {
      setSaving(true)

      if (editingId) {
        await resourceApi.update(editingId, requestBody)
        showToast('✅ Resource updated successfully!')
        setEditingId(null)
      } else {
        await resourceApi.create(requestBody)
        showToast('✅ Resource added successfully!')
      }

      setForm({ ...emptyForm })
      // Refresh the list
      await fetchResources()
    } catch (err) {
      console.error('Failed to save resource:', err)
      const errorMsg = err.response?.data?.message
        || (err.response?.data && typeof err.response.data === 'object'
          ? Object.values(err.response.data).join(', ')
          : 'Failed to save resource. Check the console for details.')
      showToast(`❌ ${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (resource) => {
    setEditingId(resource.resourceId)
    setForm({
      name: resource.name,
      type: resource.type,
      capacity: String(resource.capacity),
      location: resource.location,
      status: resource.status,
      description: resource.description || '',
      availableFrom: resource.availableFrom || '08:00',
      availableTo: resource.availableTo || '18:00',
      isBookable: resource.isBookable ?? true,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return

    try {
      await resourceApi.delete(id)
      showToast('🗑️ Resource removed')
      if (editingId === id) {
        setEditingId(null)
        setForm({ ...emptyForm })
      }
      await fetchResources()
    } catch (err) {
      console.error('Failed to delete resource:', err)
      showToast('❌ Failed to delete the resource')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
  }

  const filteredList = tableFilter
    ? resources.filter((r) => r.type === tableFilter)
    : resources

  if (loading) {
    return (
      <>
        <div className="page-header" id="admin-header">
          <h1>Admin Panel</h1>
          <p>Add, edit, and manage campus facilities and equipment</p>
        </div>
        <div className="page-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '12px', color: 'var(--text-muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading resources...</span>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="page-header" id="admin-header">
          <h1>Admin Panel</h1>
          <p>Add, edit, and manage campus facilities and equipment</p>
        </div>
        <div className="page-body">
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '60px 24px', textAlign: 'center', gap: '16px',
          }}>
            <AlertTriangle size={48} style={{ color: 'var(--accent-red)', opacity: 0.7 }} />
            <h3 style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Connection Error</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '500px' }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchResources}>Retry</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header" id="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Admin Panel</h1>
            <p>Add, edit, and manage campus facilities and equipment</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchResources} title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="admin-grid">
          {/* Form */}
          <div className="admin-form-card" id="admin-form-card">
            <h3>
              {editingId ? (
                <>
                  <Pencil size={18} /> Edit Resource
                </>
              ) : (
                <>
                  <Plus size={18} /> Add New Resource
                </>
              )}
            </h3>

            <form onSubmit={handleSubmit} id="resource-form">
              <div className="form-group">
                <label htmlFor="form-name">Resource Name *</label>
                <input
                  type="text"
                  className="form-input"
                  id="form-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Lecture Hall 201"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="form-type">Type *</label>
                  <select
                    className="form-select"
                    id="form-type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="form-capacity">Capacity *</label>
                  <input
                    type="number"
                    className="form-input"
                    id="form-capacity"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="form-location">Location *</label>
                <input
                  type="text"
                  className="form-input"
                  id="form-location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Building A – Floor 1"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="form-status">Status *</label>
                  <select
                    className="form-select"
                    id="form-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', paddingBottom: '2px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      name="isBookable"
                      checked={form.isBookable}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                    />
                    Bookable
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="form-availableFrom">Available From *</label>
                  <input
                    type="time"
                    className="form-input"
                    id="form-availableFrom"
                    name="availableFrom"
                    value={form.availableFrom}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-availableTo">Available To *</label>
                  <input
                    type="time"
                    className="form-input"
                    id="form-availableTo"
                    name="availableTo"
                    value={form.availableTo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="form-description">Description</label>
                <textarea
                  className="form-textarea"
                  id="form-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the resource, its features, and purpose..."
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" id="form-submit-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...
                    </>
                  ) : editingId ? (
                    <>
                      <Check size={16} /> Update Resource
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> Add Resource
                    </>
                  )}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListFilter size={18} /> All Resources ({filteredList.length})
              </h3>
              <select
                className="filter-select"
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
                style={{ minWidth: '140px' }}
                id="table-type-filter"
              >
                <option value="">All Types</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="resource-table-wrapper" id="resource-table">
              {filteredList.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  {resources.length === 0
                    ? 'No resources yet. Use the form to add your first resource.'
                    : 'No resources match the current filter.'}
                </div>
              ) : (
                <table className="resource-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Hours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((r) => {
                      const typeInfo = getTypeInfo(r.type)
                      const statusInfo = getStatusInfo(r.status)
                      return (
                        <tr key={r.resourceId}>
                          <td className="resource-name-cell">{r.name}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: `${typeInfo.color}18`,
                                color: typeInfo.color,
                                border: `1px solid ${typeInfo.color}33`,
                              }}
                            >
                              {typeInfo.icon} {typeInfo.label}
                            </span>
                          </td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} style={{ color: 'var(--accent-primary-light)' }} />
                              {r.location}
                            </span>
                          </td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Users size={12} style={{ color: 'var(--accent-primary-light)' }} />
                              {r.capacity}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: `${statusInfo.color}18`,
                                color: statusInfo.color,
                                border: `1px solid ${statusInfo.color}33`,
                              }}
                            >
                              ● {statusInfo.label}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap', fontFamily: "'Space Grotesk', monospace" }}>
                            {r.availableFrom} – {r.availableTo}
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleEdit(r)}
                                title="Edit"
                                id={`edit-${r.resourceId}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(r.resourceId)}
                                title="Delete"
                                id={`delete-${r.resourceId}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className="toast" id="toast">{toast}</div>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
