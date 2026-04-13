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
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { RESOURCE_TYPES, STATUSES, getTypeInfo, getStatusInfo } from '../constants';
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
    setSearchParams({})
  }

  const hasFilters = searchQuery || typeFilter || locationFilter || statusFilter || capacityFilter

  if (loading) {
    return (
      <>
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
      </>
    )
  }

  if (error) {
    return (
      <>
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
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{ height: '72px' }} /> {/* Spacer for navbar */}
      <div className="page-header" id="catalogue-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{display:'flex',alignItems:'center',gap:8}}>
              Facilities Catalogue <span style={{fontSize:24}}>✨</span>
            </h1>
            <p>Browse and search all campus resources — <span style={{color:'var(--accent-blue)',fontWeight:600}}>lecture halls</span>, <span style={{color:'var(--accent-green)',fontWeight:600}}>labs</span>, <span style={{color:'var(--accent-orange)',fontWeight:600}}>meeting rooms</span>, and <span style={{color:'var(--accent-pink)',fontWeight:600}}>equipment</span></p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => navigate('/find-best-lab')} style={{ marginBottom: 6 }}>
              Find Best Lab
            </button>
            <button className="btn btn-secondary btn-sm" onClick={fetchResources} title="Refresh">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Filter Bar */}
        <div className="filter-bar creative-filter-bar" id="filter-bar">
          <div className="search-input-wrapper creative-search">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="search-input"
            />
          </div>

          <select
            className="filter-select creative-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            id="filter-type"
          >
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>

          <select
            className="filter-select creative-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            id="filter-location"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            className="filter-select creative-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="filter-status"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            className="filter-select creative-select"
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            id="filter-capacity"
          >
            <option value="">Any Capacity</option>
            <option value="10">≤ 10 seats</option>
            <option value="50">10 – 50 seats</option>
            <option value="100">50 – 100 seats</option>
            <option value="200">100 – 200 seats</option>
            <option value="999">200+ seats</option>
          </select>

          {hasFilters && (
            <button className="btn btn-accent btn-sm creative-clear" onClick={clearFilters} id="clear-filters">
              <X size={14} /> Clear
            </button>
          )}

          <span className="results-count creative-results-count">
            <span role="img" aria-label="sparkle">🌟</span> {filteredResources.length} result{filteredResources.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Type Chips */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            className={`filter-chip ${!typeFilter ? 'active' : ''}`}
            onClick={() => setTypeFilter('')}
          >
            All
          </button>
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t.value}
              className={`filter-chip ${typeFilter === t.value ? 'active' : ''}`}
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
                ? 'No resources in the system yet. Add some from the Admin Panel.'
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
                  className="resource-card animate-in creative-card"
                  id={`resource-card-${resource.resourceId}`}
                  style={{ animationDelay: `${i * 50}ms`, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div
                    className="resource-card-banner"
                    style={{
                      background: `linear-gradient(90deg, ${typeInfo.color} 0%, ${typeInfo.color}66 100%)`,
                      minHeight: 8,
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12
                    }}
                  />
                  <div className="resource-card-body">
                    <div className="resource-card-top">
                      <span
                        className="resource-card-type"
                        style={{
                          background: `${typeInfo.color}18`,
                          color: typeInfo.color,
                          border: `1px solid ${typeInfo.color}33`,
                        }}
                      >
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      <span
                        className="resource-card-status"
                        style={{
                          background: `${statusInfo.color}18`,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}33`,
                        }}
                      >
                        <span className="status-dot" style={{ background: statusInfo.color }} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 style={{display:'flex',alignItems:'center',gap:6}}>
                      {typeInfo.icon} {resource.name}
                    </h3>
                    <p className="resource-card-desc">
                      {resource.description || 'No description available.'}
                    </p>

                    <div className="resource-card-meta creative-meta">
                      <span>
                        <MapPin className="meta-icon" size={14} />
                        {resource.location}
                      </span>
                      <span>
                        <UsersIcon className="meta-icon" size={14} />
                        {resource.capacity} {resource.capacity === 1 ? 'unit' : 'seats'}
                      </span>
                      {resource.availableFrom && resource.availableTo && (
                        <span>
                          <Clock className="meta-icon" size={14} />
                          {resource.availableFrom} – {resource.availableTo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="resource-card-footer">
                    <div className="resource-card-amenities">
                      {resource.isBookable ? (
                        <span className="amenity-tag" style={{ color: 'var(--accent-green)', borderColor: 'rgba(16,185,129,0.3)' }}>
                          ✓ Bookable
                        </span>
                      ) : (
                        <span className="amenity-tag" style={{ color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.3)' }}>
                          ✗ Not Bookable
                        </span>
                      )}
                    </div>
                    <span className="view-link" onClick={(e) => { e.stopPropagation(); setSelectedResource(resource); }} style={{ cursor: 'pointer', color: 'var(--accent-blue)' }}>
                      View <ChevronRight size={14} />
                    </span>
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
      {/* Creative styles */}
      <style>{`
        .creative-filter-bar { background: var(--surface-glass); border-radius: 16px; box-shadow: 0 2px 16px 0 rgba(0,0,0,0.04); margin-bottom: 18px; }
        .creative-search input { border-radius: 8px; border: 1px solid var(--border); }
        .creative-select { border-radius: 8px; border: 1px solid var(--border); }
        .creative-clear { background: var(--accent-pink); color: white; }
        .creative-results-count { font-weight: 600; color: var(--accent-blue); }
        .creative-grid { gap: 28px; }
        .creative-card { border-radius: 14px; }
        .creative-meta span { background: var(--surface-glass); border-radius: 6px; padding: 2px 8px; margin-right: 6px; }
      `}</style>
      <Footer />
    </>
  )
}
