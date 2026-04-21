import { useEffect } from 'react'
import { Plus, Pencil, X, Check, Loader2 } from 'lucide-react'
import { RESOURCE_TYPES, STATUSES, FACULTIES, getTypeInfo, getUnitLabel } from '../constants'

export default function ResourceFormModal({ 
  isOpen, 
  onClose, 
  editingId, 
  form, 
  errors = {},
  handleChange, 
  handleSubmit, 
  handleCancel, 
  saving 
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10 animate-in zoom-in-95 duration-300 custom-scrollbar">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#4F8CFF]">
              {editingId ? <Pencil size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1E293B]">
                {editingId ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest mt-0.5">
                {editingId ? 'Updating Database Entry' : 'New Database Entry'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-all text-[#94A3B8] hover:text-[#64748B]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="modal-form-name" className="text-xs font-bold text-[#475569] px-1 italic">Resource Name *</label>
              <input
                type="text"
                className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none ${errors.name ? 'ring-2 ring-red-500/50' : ''}`}
                id="modal-form-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Lecture Hall 201"
              />
              {errors.name && <span className="text-red-500 text-[10px] font-bold mt-0.5 ml-1 animate-in fade-in slide-in-from-top-1">{errors.name}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="modal-form-type" className="text-xs font-bold text-[#475569] px-1 italic">Type *</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none cursor-pointer"
                  id="modal-form-type"
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
                <label htmlFor="modal-form-capacity" className="text-xs font-bold text-[#475569] px-1 italic">
                  {getTypeInfo(form.type).unit === 'units' ? 'Quantity *' : 'Capacity *'}
                </label>
                <input
                  type="number"
                  min="1"
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 outline-none font-sans ${errors.capacity ? 'ring-2 ring-red-500/50' : ''}`}
                  id="modal-form-capacity"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder={['PROJECTOR', 'CAMERA', 'EQUIPMENT'].includes(form.type) ? "e.g. 5" : "e.g. 100"}
                />
                {errors.capacity && <span className="text-red-500 text-[10px] font-bold mt-0.5 ml-1 animate-in fade-in slide-in-from-top-1">{errors.capacity}</span>}
              </div>
            </div>

            {['PROJECTOR', 'CAMERA', 'EQUIPMENT'].includes(form.type) && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="modal-form-brand" className="text-xs font-bold text-[#475569] px-1 italic">Brand</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none"
                      id="modal-form-brand"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="e.g. Sony, Epson"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="modal-form-model" className="text-xs font-bold text-[#475569] px-1 italic">Model</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none"
                      id="modal-form-model"
                      name="model"
                      value={form.model}
                      onChange={handleChange}
                      placeholder="e.g. VPL-EX435"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="modal-form-serial" className="text-xs font-bold text-[#475569] px-1 italic">Serial Number / Asset ID</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none"
                    id="modal-form-serial"
                    name="serialNumber"
                    value={form.serialNumber}
                    onChange={handleChange}
                    placeholder="e.g. SN-12345678"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="modal-form-location" className="text-xs font-bold text-[#475569] px-1 italic">Location *</label>
                <input
                  type="text"
                  className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none ${errors.location ? 'ring-2 ring-red-500/50' : ''}`}
                  id="modal-form-location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Building A – Floor 1"
                />
                {errors.location && <span className="text-red-500 text-[10px] font-bold mt-0.5 ml-1 animate-in fade-in slide-in-from-top-1">{errors.location}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="modal-form-department" className="text-xs font-bold text-[#475569] px-1 italic">Department *</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none cursor-pointer font-sans"
                  id="modal-form-department"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="modal-form-status" className="text-xs font-bold text-[#475569] px-1 italic">Status *</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none cursor-pointer"
                  id="modal-form-status"
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

              <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-11 h-6 bg-slate-200 rounded-full checked:bg-[#4F8CFF] transition-all cursor-pointer"
                      name="isBookable"
                      checked={form.isBookable}
                      onChange={handleChange}
                    />
                    <div className="absolute left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-6 shadow-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1E293B]">Open for Booking</span>
                    <span className="text-[10px] text-[#64748B] font-medium leading-none">Toggle to allow users to reserve this resource</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="modal-form-availableFrom" className="text-xs font-bold text-[#475569] px-1 italic">Operating Hours From *</label>
                <div className="relative">
                  <input
                    type="time"
                    className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 outline-none font-sans ${errors.availableFrom ? 'ring-2 ring-red-500/50' : ''}`}
                    id="modal-form-availableFrom"
                    name="availableFrom"
                    value={form.availableFrom}
                    onChange={handleChange}
                  />
                  {errors.availableFrom && <span className="text-red-500 text-[10px] font-bold mt-0.5 ml-1 animate-in fade-in slide-in-from-top-1">{errors.availableFrom}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="modal-form-availableTo" className="text-xs font-bold text-[#475569] px-1 italic">Operating Hours To *</label>
                <div className="relative">
                  <input
                    type="time"
                    className={`w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] focus:ring-2 focus:ring-[#4F8CFF]/50 outline-none font-sans ${errors.availableTo ? 'ring-2 ring-red-500/50' : ''}`}
                    id="modal-form-availableTo"
                    name="availableTo"
                    value={form.availableTo}
                    onChange={handleChange}
                  />
                  {errors.availableTo && <span className="text-red-500 text-[10px] font-bold mt-0.5 ml-1 animate-in fade-in slide-in-from-top-1">{errors.availableTo}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="modal-form-description" className="text-xs font-bold text-[#475569] px-1 italic">Description / Additional Notes</label>
              <textarea
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#4F8CFF]/50 transition-all outline-none resize-none"
                id="modal-form-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Special features, equipment, or access notes..."
                rows={4}
              />
            </div>

            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white shadow-[0_-20px_20px_-10px_rgba(255,255,255,0.9)]">
              <button 
                type="button" 
                className="flex-1 px-8 py-4 bg-slate-100 text-[#64748B] font-bold rounded-2xl hover:bg-slate-200 transition-all" 
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-[2] bg-blue-gradient text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70" 
                disabled={saving}
              >
                {saving ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : editingId ? (
                  <><Check size={20} /> Update Resource</>
                ) : (
                  <><Plus size={20} /> Add to Database</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
