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
} from 'lucide-react'
import { RESOURCE_TYPES, STATUSES, FACULTIES, getTypeInfo, getStatusInfo, getUnitLabel } from '../constants'
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
    if (!form.name.trim()) return 'Resource name is required';
    if (/^\d+$/.test(form.name.trim())) return 'Resource name cannot be only numbers';
    if (!form.capacity) return 'Capacity is required';
    
    const cap = Number(form.capacity);
    if (isNaN(cap) || cap < 1 || !Number.isInteger(cap)) return 'Capacity must be a positive whole number';
    if (!form.location.trim()) return 'Location is required';

    // Time range validation
    const [fromH, fromM] = form.availableFrom.split(':').map(Number);
    const [toH, toM] = form.availableTo.split(':').map(Number);
    const fromVal = fromH * 60 + fromM;
    const toVal = toH * 60 + toM;
    
    if (fromVal >= toVal) {
      return 'Opening time must be earlier than closing time';
    }

    const minTime = 8 * 60; // 08:00
    const maxTime = 18 * 60; // 18:00

    if (fromVal < minTime || fromVal > maxTime || toVal < minTime || toVal > maxTime) {
      return 'Operating hours must be between 08:00 and 18:00';
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target
    if (inputType === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: e.target.checked }))
    } else {
      setForm((prev) => {
        const newForm = { ...prev, [name]: value }
        
        // Logic: If status is set to OUT_OF_SERVICE or MAINTENANCE, 
        // automatically turn off the "Bookable" flag to maintain data integrity.
        if (name === 'status' && (value === 'OUT_OF_SERVICE' || value === 'MAINTENANCE')) {
          newForm.isBookable = false
        }
        
        return newForm
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errorMsg = validateForm();
    if (errorMsg) {
      showToast(errorMsg, 'error')
      return
    }

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const handleCancel = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
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
      <div className="pt-8 pb-10 border-b border-slate-100 bg-white/80 backdrop-blur-md px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Resources</h1>
            <p className="text-[#64748B] text-sm font-bold mt-1">Streamline your campus facility management</p>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-[#1E293B] hover:bg-slate-100 text-sm font-bold rounded-xl border border-slate-200 transition-all font-sans"
            onClick={fetchResources} 
            title="Refresh"
          >
            <RefreshCw size={16} className={saving ? 'animate-spin' : ''} /> Refresh List
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Section */}
          <div className="lg:col-span-4" id="admin-form-section">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-28">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#4F8CFF]">
                  {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">
                    {editingId ? 'Edit Resource' : 'Add New Resource'}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">
                    {editingId ? 'Updating Entry' : 'New Database Entry'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="form-name" className="text-xs font-bold text-[#475569] px-1 italic">Resource Name *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none"
                    id="form-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Lecture Hall 201"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-type" className="text-xs font-bold text-[#475569] px-1 italic">Type *</label>
                    <select
                      className="w-full bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none cursor-pointer"
                      id="form-type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                    >
                      {RESOURCE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-capacity" className="text-xs font-bold text-[#475569] px-1 italic">
                      {getTypeInfo(form.type).unit === 'units' ? 'Quantity *' : 'Capacity *'}
                    </label>
                    <input
                      type="number"
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 outline-none font-sans"
                      id="form-capacity"
                      name="capacity"
                      value={form.capacity}
                      onChange={handleChange}
                      placeholder={['PROJECTOR', 'CAMERA', 'EQUIPMENT'].includes(form.type) ? "e.g. 5" : "e.g. 100"}
                    />
                  </div>
                </div>

                {['PROJECTOR', 'CAMERA', 'EQUIPMENT'].includes(form.type) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="form-brand" className="text-xs font-bold text-[#475569] px-1 italic">Brand</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none"
                          id="form-brand"
                          name="brand"
                          value={form.brand}
                          onChange={handleChange}
                          placeholder="e.g. Sony, Epson"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="form-model" className="text-xs font-bold text-[#475569] px-1 italic">Model</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none"
                          id="form-model"
                          name="model"
                          value={form.model}
                          onChange={handleChange}
                          placeholder="e.g. VPL-EX435"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="form-serial" className="text-xs font-bold text-[#475569] px-1 italic">Serial Number / Asset ID</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none"
                        id="form-serial"
                        name="serialNumber"
                        value={form.serialNumber}
                        onChange={handleChange}
                        placeholder="e.g. SN-12345678"
                      />
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="form-location" className="text-xs font-bold text-[#475569] px-1 italic">Location *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none"
                    id="form-location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Building A – Floor 1"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="form-department" className="text-xs font-bold text-[#475569] px-1 italic">Department *</label>
                  <select
                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none cursor-pointer font-sans"
                    id="form-department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                  >
                    {FACULTIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-status" className="text-xs font-bold text-[#475569] px-1 italic">Status *</label>
                    <select
                      className="w-full bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none cursor-pointer"
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

                  <div className="flex flex-col justify-end pb-1.5">
                    <label className="flex items-center gap-3 cursor-pointer select-none group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-10 h-6 bg-slate-100 rounded-full checked:bg-[#4F8CFF] transition-all cursor-pointer"
                          name="isBookable"
                          checked={form.isBookable}
                          onChange={handleChange}
                        />
                        <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5 shadow-sm" />
                      </div>
                      <span className="text-xs font-bold text-[#475569] italic">Bookable</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-availableFrom" className="text-xs font-bold text-[#475569] px-1 italic">From *</label>
                    <input
                      type="time"
                      className="w-full bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 outline-none font-sans"
                      id="form-availableFrom"
                      name="availableFrom"
                      value={form.availableFrom}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-availableTo" className="text-xs font-bold text-[#475569] px-1 italic">To *</label>
                    <input
                      type="time"
                      className="w-full bg-slate-50 border-none rounded-xl px-3 py-3 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 outline-none font-sans"
                      id="form-availableTo"
                      name="availableTo"
                      value={form.availableTo}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="form-description" className="text-xs font-bold text-[#475569] px-1 italic">Description</label>
                  <textarea
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none resize-none"
                    id="form-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Special features, equipment, or access notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-gradient text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70" 
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : editingId ? (
                      <><Check size={18} /> Update</>
                    ) : (
                      <><Plus size={18} /> Add Resource</>
                    )}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      className="px-5 bg-slate-100 text-[#64748B] font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center" 
                      onClick={handleCancel}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Table Section */}
          <div className="lg:col-span-8">
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
      </div>

      {/* Custom Confirmation Modal */}
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

      {/* Toast System */}
      {toast.visible && (
        <div className={`toast-notification !left-1/2 !-translate-x-1/2 !right-auto flex items-center gap-3 ${toast.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          </div>
          <span className="pr-2">{toast.message}</span>
        </div>
      )}
    </div>
  )
}
