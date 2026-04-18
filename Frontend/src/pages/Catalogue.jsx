import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Users as UsersIcon,
  Clock,
  ChevronRight,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  LayoutDashboard,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { RESOURCE_TYPES, STATUSES, FACULTIES, getTypeInfo, getStatusInfo } from '../constants';
import { resourceApi } from '../services/api';
import ResourceDetailModal from '../components/ResourceDetailModal'


export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [statusFilter, setStatusFilter] = useState('')
  const [capacityFilter, setCapacityFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  // Server-side filter (location is a free text from backend)
  const [locationFilter, setLocationFilter] = useState('')

  const [selectedResource, setSelectedResource] = useState(null)

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

  // Collect unique locations from fetched data
  const uniqueLocations = useMemo(() => {
    const locs = [...new Set(resources.map((r) => r.location).filter(Boolean))]
    locs.sort()
    return locs
  }, [resources])

  // Client-side filtering
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesSearch =
          (r.name || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          (r.location || '').toLowerCase().includes(q)
        if (!matchesSearch) return false
      }

      // Type
      if (typeFilter && r.type !== typeFilter) return false

      // Location
      if (locationFilter && r.location !== locationFilter) return false

      // Status
      if (statusFilter && r.status !== statusFilter) return false

      // Department
      if (departmentFilter && r.department !== departmentFilter) return false

      // Capacity
      if (capacityFilter) {
        const cap = parseInt(capacityFilter)
        if (cap === 10 && r.capacity > 10) return false
        if (cap === 50 && (r.capacity < 10 || r.capacity > 50)) return false
        if (cap === 100 && (r.capacity < 50 || r.capacity > 100)) return false
        if (cap === 200 && (r.capacity < 100 || r.capacity > 200)) return false
        if (cap === 999 && r.capacity < 200) return false
      }

      return true
    })
  }, [resources, searchQuery, typeFilter, locationFilter, statusFilter, capacityFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setTypeFilter('')
    setLocationFilter('')
    setStatusFilter('')
    setCapacityFilter('')
    setDepartmentFilter('')
    setSearchParams({})
  }

  const hasFilters = searchQuery || typeFilter || locationFilter || statusFilter || capacityFilter || departmentFilter

  if (loading) {
    return (
      <div className="light-theme min-h-screen">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="page-header" id="catalogue-header">
          <h1>Facilities Catalogue</h1>
          <p>Browse and search all campus resources</p>
        </div>
        <div className="page-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '12px', color: 'var(--text-muted)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading resources...</span>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="light-theme min-h-screen">
        <Navbar />
        <div style={{ height: '72px' }} />
        <div className="page-header" id="catalogue-header">
          <h1>Facilities Catalogue</h1>
          <p>Browse and search all campus resources</p>
        </div>
        <div className="page-body">
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '60px 24px', textAlign: 'center', gap: '16px',
          }}>
            <AlertTriangle size={48} style={{ color: 'var(--accent-red)', opacity: 0.7 }} />
            <h3 style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>Connection Error</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '500px' }}>{error}</p>
            <button className="btn btn-primary" onClick={fetchResources}>
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="light-theme min-h-screen">
      <Navbar />
      <div style={{ height: '72px' }} /> {/* Spacer for navbar */}
      <div className="px-8 py-10 bg-white border-b border-slate-100/50" id="catalogue-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-16">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 gradient-text">
              Facilities Catalogue <span className="text-2xl">✨</span>
            </h1>
            <p className="text-[#334155] mt-2 max-w-[600px] leading-relaxed">
              Browse and search all campus resources — 
              <span className="text-[#4F8CFF] font-semibold mx-1">lecture halls</span>, 
              <span className="text-[#10B981] font-semibold mx-1">labs</span>, 
              <span className="text-[#F59E0B] font-semibold mx-1">meeting rooms</span>, and 
              <span className="text-[#EC4899] font-semibold mx-1">equipment</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 items-end">
            <button 
              className="px-6 py-2.5 bg-blue-gradient text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 active:scale-95" 
              onClick={() => navigate('/find-best-lab')}
            >
              Find Best Lab
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#334155] hover:text-[#1E293B] bg-slate-50 border border-slate-200 rounded-xl transition-all duration-300" 
              onClick={fetchResources} 
              title="Refresh"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Filter Bar */}
        <div className="bg-white p-6 mb-8 rounded-xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4 transition-all duration-300" id="filter-bar">
          <div className="relative flex-1 min-w-[300px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors group-focus-within:text-[#4F8CFF]" size={18} />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#4F8CFF] outline-none transition-all placeholder:text-[#64748B]"
              placeholder="Search by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-input"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] text-sm cursor-pointer hover:bg-white hover:border-[#4F8CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none pr-10"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              id="filter-type"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">All Types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <select
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] text-sm cursor-pointer hover:bg-white hover:border-[#4F8CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none pr-10"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              id="filter-location"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <select
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] text-sm cursor-pointer hover:bg-white hover:border-[#4F8CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none pr-10"
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              id="filter-capacity"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">Any Capacity</option>
              <option value="10">≤ 10 seats</option>
              <option value="50">10 – 50 seats</option>
              <option value="100">50 – 100 seats</option>
              <option value="200">100 – 200 seats</option>
              <option value="999">200+ seats</option>
            </select>

            <select
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] text-sm cursor-pointer hover:bg-white hover:border-[#4F8CFF] focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none pr-10"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              id="filter-department"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">All Departments</option>
              {FACULTIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>

            {hasFilters && (
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#EC4899] bg-pink-50 hover:bg-pink-100 rounded-xl transition-all" onClick={clearFilters} id="clear-filters">
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <div className="ml-auto text-sm font-medium text-[#64748B] flex items-center gap-2">
            <span role="img" aria-label="sparkle">🌟</span> {filteredResources.length} result{filteredResources.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Type Chips */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              !typeFilter 
                ? 'bg-blue-gradient text-white shadow-md shadow-blue-200 active:scale-95' 
                : 'bg-slate-100 text-[#475569] hover:bg-slate-200 hover:text-[#1E293B] active:scale-95'
            }`}
            onClick={() => setTypeFilter('')}
          >
            All
          </button>
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t.value}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                typeFilter === t.value 
                  ? 'bg-blue-gradient text-white shadow-md shadow-blue-200 active:scale-95' 
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#1E293B] active:scale-95'
              }`}
              onClick={() => setTypeFilter(typeFilter === t.value ? '' : t.value)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Resource Grid */}
        {filteredResources.length === 0 ? (
          <div className="empty-state" id="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No resources found</h3>
            <p>
              {resources.length === 0
                ? 'No resources in the system yet. Add some from the Resources section.'
                : 'Try adjusting your search or filter criteria to find what you\'re looking for.'}
            </p>
            {hasFilters && (
              <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '16px' }}>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="resource-grid creative-grid" id="resource-grid">
            {filteredResources.map((resource, i) => {
              const typeInfo = getTypeInfo(resource.type)
              const statusInfo = getStatusInfo(resource.status)
              return (
                <div
                  key={resource.resourceId}
                  className={`relative group bg-white rounded-2xl border border-slate-100 p-1 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 ${
                    !resource.isBookable ? 'opacity-80' : ''
                  }`}
                  id={`resource-card-${resource.resourceId}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => setSelectedResource(resource)}
                >
                  {!resource.isBookable && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 flex justify-center pointer-events-none">
                      <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-2xl">
                        Unavailable
                      </span>
                    </div>
                  )}

                  <div
                    className="h-2 w-full rounded-t-xl"
                    style={{ background: `linear-gradient(90deg, ${typeInfo.color} 0%, ${typeInfo.color}44 100%)` }}
                  />
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${typeInfo.color}10`, color: typeInfo.color }}
                      >
                        {typeInfo.label}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 ${
                          resource.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-600' 
                            : resource.status === 'OUT_OF_SERVICE' 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          resource.status === 'ACTIVE' ? 'bg-green-500' : resource.status === 'OUT_OF_SERVICE' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#1E293B] mb-2 group-hover:text-[#4F8CFF] transition-colors line-clamp-1">
                      {resource.name}
                    </h3>
                    <p className="text-sm text-[#334155] line-clamp-2 leading-relaxed h-[40px] mb-6 font-medium">
                      {resource.description || 'No description available.'}
                    </p>

                    <div className="grid grid-cols-2 gap-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xs text-[#334155]">
                        <MapPin size={14} className="text-[#64748B]" />
                        <span className="line-clamp-1 font-medium">{resource.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#334155]">
                        <LayoutDashboard size={14} className="text-[#64748B]" />
                        <span className="line-clamp-1 font-medium">{FACULTIES.find(f => f.value === resource.department || f.value === resource.faculty)?.label || resource.department || resource.faculty || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#334155]">
                        <UsersIcon size={14} className="text-[#64748B]" />
                        <span className="font-medium">{resource.capacity} {resource.capacity === 1 ? 'unit' : 'seats'}</span>
                      </div>
                      {resource.availableFrom && (
                        <div className="flex items-center gap-2 text-xs text-[#334155] col-span-2">
                          <Clock size={14} className="text-[#64748B]" />
                          <span className="font-medium">{resource.availableFrom} – {resource.availableTo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 rounded-b-2xl">
                    <button 
                      className="text-sm font-bold text-[#334155] hover:text-[#4F8CFF] flex items-center gap-1 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setSelectedResource(resource); }}
                    >
                      View <ChevronRight size={16} />
                    </button>
                    
                    <div className="flex items-center gap-3">
                      {resource.isBookable ? (
                        <>
                          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">
                            Bookable
                          </span>
                          <button 
                            className="px-4 py-1.5 bg-blue-gradient text-white text-xs font-bold rounded-lg shadow-blue-500/20 shadow-lg hover:shadow-xl transition-all"
                            onClick={(e) => { e.stopPropagation(); navigate(`/booking?resource=${resource.resourceId}`); }}
                          >
                            Book Now
                          </button>
                        </>
                      ) : (
                        <span 
                          className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md cursor-help" 
                          title="Already booked"
                        >
                          Not Bookable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedResource && (
        <ResourceDetailModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
      <Footer />
    </div>
  )
}
