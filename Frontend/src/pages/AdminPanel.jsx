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
  Clock,
  LayoutDashboard,
  AlertCircle,
  CheckCircle,
  Star,
  MessageSquare,
  Calendar,
} from 'lucide-react'
import { RESOURCE_TYPES, STATUSES, FACULTIES, getTypeInfo, getStatusInfo, getUnitLabel } from '../constants'
import { resourceApi, feedbackApi } from '../services/api'
import ResourceFormModal from '../components/ResourceFormModal'

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
  department: 'Faculty of Computing',
  brand: '',
  model: '',
  serialNumber: '',
}

export default function AdminPanel() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' })
  const [deleteConfirm, setDeleteConfirm] = useState({ visible: false, id: null, name: '' })
  const [tableFilter, setTableFilter] = useState('')
  const [activeTab, setActiveTab] = useState('resources') // 'resources' or 'feedbacks'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [feedbacks, setFeedbacks] = useState([])
  const [fetchingFeedbacks, setFetchingFeedbacks] = useState(false)
  const [viewingFeedback, setViewingFeedback] = useState(null)
  const [deleteFeedbackConfirm, setDeleteFeedbackConfirm] = useState({ visible: false, id: null })

  useEffect(() => {
    fetchResources()
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      setFetchingFeedbacks(true)
      const response = await feedbackApi.getAll()
      setFeedbacks(response.data)
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err)
      showToast('Failed to retrieve feedback data. Check connection.', 'error')
    } finally {
      setFetchingFeedbacks(false)
    }
  }

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await resourceApi.getAll()
      setResources(response.data)
    } catch (err) {
      console.error('Failed to fetch resources:', err)
      setError(err.response?.data?.message || 'Failed to connect to the server. Make sure the backend is running on port 8080.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Resource name is required'
    else if (/^\d+$/.test(form.name.trim())) newErrors.name = 'Alphabetical characters required'
    
    if (!form.capacity) newErrors.capacity = 'Capacity is required'
    else {
      const cap = Number(form.capacity)
      if (isNaN(cap) || cap < 1 || !Number.isInteger(cap)) newErrors.capacity = 'Must be a positive whole number'
    }
    
    if (!form.location.trim()) newErrors.location = 'Location is required'

    const [fromH, fromM] = form.availableFrom.split(':').map(Number)
    const [toH, toM] = form.availableTo.split(':').map(Number)
    const fromVal = fromH * 60 + fromM
    const toVal = toH * 60 + toM
    
    if (fromVal >= toVal) {
      newErrors.availableTo = 'Closing must be later than opening'
    }

    const minTime = 8 * 60
    const maxTime = 18 * 60

    if (fromVal < minTime || fromVal > maxTime) newErrors.availableFrom = 'Must be 08:00 - 18:00'
    if (toVal < minTime || toVal > maxTime) newErrors.availableTo = 'Must be 08:00 - 18:00'

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target
    if (inputType === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: e.target.checked }))
    } else {
      setForm((prev) => {
        const newForm = { ...prev, [name]: value }
        if (name === 'status' && (value === 'OUT_OF_SERVICE' || value === 'MAINTENANCE')) {
          newForm.isBookable = false
        }
        return newForm
      })
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    // Build the request body matching ResourceRequest DTO
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
      department: form.department,
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      serialNumber: form.serialNumber.trim() || null,
    }

    try {
      setSaving(true)

      if (editingId) {
        await resourceApi.update(editingId, requestBody)
        showToast('Resource updated successfully!', 'success')
        setEditingId(null)
      } else {
        await resourceApi.create(requestBody)
        showToast('Resource added successfully!', 'success')
      }

      setForm({ ...emptyForm })
      setIsModalOpen(false)
      // Refresh the list
      await fetchResources()
    } catch (err) {
      console.error('Failed to save resource:', err)
      
      // Extract detailed error message from backend if available
      let errorMsg = 'Failed to save resource. Check the console for details.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else if (typeof err.response.data === 'object') {
          // If it's a validation error map, format it nicely
          errorMsg = Object.entries(err.response.data)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
        }
      }
      
      showToast(errorMsg, 'error')
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
      department: resource.department || 'Faculty of Computing',
      brand: resource.brand || '',
      model: resource.model || '',
      serialNumber: resource.serialNumber || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (resource) => {
    setDeleteConfirm({ visible: true, id: resource.resourceId, name: resource.name })
  }

  const confirmDelete = async () => {
    const { id } = deleteConfirm
    try {
      setSaving(true)
      await resourceApi.delete(id)
      showToast('Resource removed successfully', 'success')
      if (editingId === id) {
        setEditingId(null)
        setForm({ ...emptyForm })
      }
      setDeleteConfirm({ visible: false, id: null, name: '' })
      await fetchResources()
    } catch (err) {
      console.error('Failed to delete resource:', err)
      showToast('Failed to delete the resource', 'error')
    } finally {
      setSaving(false)
    }
  }

  const confirmDeleteFeedback = async () => {
    const { id } = deleteFeedbackConfirm
    try {
      setSaving(true)
      await feedbackApi.delete(id)
      showToast('Feedback removed successfully', 'success')
      setDeleteFeedbackConfirm({ visible: false, id: null })
      await fetchFeedbacks()
    } catch (err) {
      console.error('Failed to delete feedback:', err)
      showToast('Failed to delete feedback', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setIsModalOpen(false)
    setErrors({})
  }

  const filteredList = tableFilter
    ? resources.filter((r) => r.type === tableFilter)
    : resources

  if (loading) {
    return (
      <div className="light-theme min-h-screen bg-[#F8FAFC]">
        <div className="pt-24 pb-8 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold gradient-text">Resources</h1>
            <p className="text-[#64748B] text-sm font-medium mt-1">Add, edit, and manage campus facilities and equipment</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-20 flex flex-col items-center justify-center gap-4 text-[#64748B]">
          <Loader2 size={32} className="animate-spin text-[#4F8CFF]" />
          <span className="font-bold">Accessing secure database...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="light-theme min-h-screen bg-[#F8FAFC]">
        <div className="pt-24 pb-8 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold gradient-text">Resources</h1>
            <p className="text-[#64748B] text-sm font-medium mt-1">Add, edit, and manage campus facilities and equipment</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-20 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1E293B]">Management Console Offline</h3>
            <p className="text-[#64748B] max-w-[500px] mt-2 font-medium">{error}</p>
          </div>
          <button 
            className="px-6 py-2.5 bg-blue-gradient text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all" 
            onClick={fetchResources}
          >
            Reconnect to System
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="light-theme min-h-screen bg-[#F8FAFC]">
      <div className="pt-8 pb-1 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 mb-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-[#64748B] text-sm font-bold mt-1">Streamline your campus facility management</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-gradient text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
              onClick={() => {
                setEditingId(null);
                setForm({ ...emptyForm });
                setIsModalOpen(true);
              }}
            >
              <Plus size={18} /> Add Resource
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#1E293B] hover:bg-slate-50 text-sm font-bold rounded-xl border border-slate-200 transition-all font-sans"
              onClick={activeTab === 'resources' ? fetchResources : fetchFeedbacks} 
              title="Refresh"
            >
              <RefreshCw size={16} className={(saving || fetchingFeedbacks) ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-8 border-b border-transparent">
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'resources' ? 'text-[#4F8CFF]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
          >
            Manage Resources
            {activeTab === 'resources' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4F8CFF] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'feedbacks' ? 'text-[#4F8CFF]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
          >
            Manage Feedbacks
            {activeTab === 'feedbacks' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#4F8CFF] rounded-t-full" />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 pb-20">
        {activeTab === 'resources' ? (
          <div className="flex flex-col gap-8">
            
            {/* Table Section */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                  <ListFilter size={20} className="text-[#4F8CFF]" />
                  <h3 className="text-base font-bold text-[#1E293B] uppercase tracking-wide">System Resources ({filteredList.length})</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider hidden sm:inline">Filter By:</span>
                  <select
                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-[#334155] focus:ring-2 focus:ring-blue-500/10 outline-none cursor-pointer"
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  {filteredList.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <LayoutDashboard size={32} className="text-[#94A3B8]" />
                      </div>
                      <p className="text-[#94A3B8] font-bold italic">
                        {resources.length === 0
                          ? 'System is currently empty. Add your first resource.'
                          : 'No results found for this category.'}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Resource Name</th>
                          <th className="px-6 py-4 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Properties</th>
                          <th className="px-6 py-4 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Department</th>
                          <th className="px-6 py-4 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Status</th>
                          <th className="px-6 py-4 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Hours</th>
                          <th className="px-6 py-4 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredList.map((r, i) => {
                          const typeInfo = getTypeInfo(r.type)
                          const statusInfo = getStatusInfo(r.status)
                          return (
                            <tr key={r.resourceId} className="hover:bg-slate-50/40 transition-colors animate-in" style={{ animationDelay: `${i * 30}ms` }}>
                              <td className="px-6 py-4">
                                <div className="text-sm font-bold text-[#1E293B]">{r.name}</div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${typeInfo.color}10`, color: typeInfo.color }}>
                                    {typeInfo.label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1 text-[#64748B]">
                                  <div className="text-[11px] font-bold flex items-center gap-1.5">
                                    <MapPin size={12} className="text-[#4F8CFF]" /> {r.location}
                                  </div>
                                  <div className="text-[11px] font-bold flex items-center gap-1.5">
                                    <Users size={12} className="text-[#4F8CFF]" /> 
                                    {r.capacity} <span className="capitalize">{getUnitLabel(r.type, r.capacity)}</span>
                                  </div>
                                  {(r.brand || r.model) && (
                                    <div className="text-[10px] font-extrabold text-[#1E293B] bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block w-fit">
                                      {r.brand} {r.model}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[11px] font-bold text-[#4F8CFF] bg-blue-50 px-2.5 py-1 rounded-lg">
                                  {FACULTIES.find(f => f.value === r.department || f.value === r.faculty)?.label || r.department || r.faculty || 'General'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                    r.status === 'ACTIVE' 
                                      ? 'bg-green-100 text-green-600' 
                                      : r.status === 'OUT_OF_SERVICE' 
                                        ? 'bg-red-100 text-red-600' 
                                        : 'bg-amber-100 text-amber-600'
                                  }`}
                                >
                                  ● {statusInfo.label}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E293B] font-mono">
                                  <Clock size={12} className="text-[#4F8CFF]" />
                                  {r.availableFrom} - {r.availableTo}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    className="p-2 text-[#64748B] hover:text-[#4F8CFF] hover:bg-blue-50 rounded-lg transition-all"
                                    onClick={() => handleEdit(r)}
                                    title="Edit Entry"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button
                                    className="p-2 text-[#64748B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    onClick={() => handleDelete(r)}
                                    title="Delete Entry"
                                  >
                                    <Trash2 size={16} />
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
        ) : (
          /* Feedback Management View */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <Star size={22} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1E293B]">Community Feedback</h2>
                  <p className="text-xs text-[#64748B] font-medium">Review and moderate campus experience reports</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm text-sm font-bold text-[#4F8CFF]">
                <MessageSquare size={16} /> {feedbacks.length} Total Reports
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                {fetchingFeedbacks ? (
                  <div className="py-24 flex flex-col items-center justify-center gap-4 text-[#94A3B8]">
                    <Loader2 size={32} className="animate-spin text-[#4F8CFF]" />
                    <span className="font-bold">Retrieving feedback database...</span>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="py-24 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={32} className="text-[#94A3B8]" />
                    </div>
                    <p className="text-[#94A3B8] font-bold italic">No feedback entries found in the system yet.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Resource</th>
                        <th className="px-8 py-5 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Rating</th>
                        <th className="px-8 py-5 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Comment Highlights</th>
                        <th className="px-8 py-5 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest">Date Reported</th>
                        <th className="px-8 py-5 text-[11px] font-extrabold text-[#64748B] uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {feedbacks.map((f, i) => (
                        <tr key={f.feedbackId} className="hover:bg-slate-50/40 transition-colors animate-in" style={{ animationDelay: `${i * 30}ms` }}>
                          <td className="px-8 py-5">
                            <div className="text-sm font-bold text-[#1E293B]">{f.resourceName || 'Unknown Resource'}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-extrabold text-[#4F8CFF] uppercase tracking-tighter">ID: {f.resourceId}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(5)].map((_, idx) => (
                                <Star key={idx} size={14} fill={idx < f.rating ? "currentColor" : "none"} className={idx < f.rating ? "" : "text-slate-200"} />
                              ))}
                              <span className="ml-2 text-xs font-black text-[#1E293B]">{f.rating}.0</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-sm text-[#475569] leading-relaxed max-w-xs truncate font-medium italic">
                              "{f.comment}"
                            </p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#64748B]">
                              <Calendar size={13} />
                              {new Date(f.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                className="px-3 py-1.5 text-[10px] font-bold text-[#4F8CFF] bg-blue-50 rounded-lg hover:bg-blue-100 transition-all uppercase tracking-wide"
                                onClick={() => setViewingFeedback(f)}
                              >
                                View Full
                              </button>
                              <button
                                className="p-2 text-[#94A3B8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                onClick={() => setDeleteFeedbackConfirm({ visible: true, id: f.feedbackId })}
                                title="Delete Feedback"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      {deleteConfirm.visible && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDeleteConfirm({ visible: false, id: null, name: '' })} />
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-8 relative z-10 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-[#1E293B] mb-2">Confirm Removal</h3>
              <p className="text-[#64748B] text-sm font-medium leading-relaxed">
                Are you sure you want to delete <span className="text-[#1E293B] font-bold">"{deleteConfirm.name}"</span>? This action is permanent and cannot be reversed.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                className="flex-1 px-6 py-3 bg-slate-100 text-[#64748B] font-bold rounded-2xl hover:bg-slate-200 transition-all"
                onClick={() => setDeleteConfirm({ visible: false, id: null, name: '' })}
              >
                Cancel
              </button>
              <button 
                className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                onClick={confirmDelete}
                disabled={saving}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteFeedbackConfirm.visible && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDeleteFeedbackConfirm({ visible: false, id: null })} />
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-8 relative z-10 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-[#1E293B] mb-2">Delete Feedback?</h3>
              <p className="text-[#64748B] text-sm font-medium leading-relaxed">
                Are you sure you want to remove this feedback report? This action is irreversible.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                className="flex-1 px-6 py-3 bg-slate-100 text-[#64748B] font-bold rounded-2xl hover:bg-slate-200 transition-all"
                onClick={() => setDeleteFeedbackConfirm({ visible: false, id: null })}
              >
                Keep Report
              </button>
              <button 
                className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                onClick={confirmDeleteFeedback}
                disabled={saving}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Feedback Modal */}
      {viewingFeedback && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setViewingFeedback(null)} />
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-8 relative z-10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#4F8CFF]">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Feedback Details</h3>
                  <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">{viewingFeedback.resourceName}</p>
                </div>
              </div>
              <button onClick={() => setViewingFeedback(null)} className="p-2 hover:bg-slate-50 rounded-full transition-all text-[#94A3B8] hover:text-[#64748B]">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={18} fill={idx < viewingFeedback.rating ? "currentColor" : "none"} className={idx < viewingFeedback.rating ? "" : "text-slate-200"} />
                ))}
                <span className="ml-2 text-sm font-bold text-[#1E293B]">{viewingFeedback.rating}.0 Rating</span>
              </div>
              <p className="text-[#334155] text-sm leading-relaxed font-medium italic">
                "{viewingFeedback.comment}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-[#64748B] mb-8">
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-widest text-[9px] text-[#94A3B8]">Resource ID</span>
                <span className="text-[#1E293B]">{viewingFeedback.resourceId}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="uppercase tracking-widest text-[9px] text-[#94A3B8]">Date Submitted</span>
                <span className="text-[#1E293B]">{new Date(viewingFeedback.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="w-full py-3 bg-[#4F8CFF] text-white font-bold rounded-2xl hover:bg-blue-600 transition-all font-sans"
              onClick={() => setViewingFeedback(null)}
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Toast System */}
      {toast.visible && (
        <div className={`toast-notification !left-1/2 !-translate-x-1/2 !right-auto flex items-center gap-3 ${toast.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          </div>
          <span className="pr-2">{toast.message}</span>
        </div>
      )}

      {/* Resource Form Modal */}
      <ResourceFormModal
        isOpen={isModalOpen}
        onClose={handleCancel}
        editingId={editingId}
        form={form}
        errors={errors}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        saving={saving}
      />
    </div>
  )
}
