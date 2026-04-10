import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, BarChart3, Loader2, AlertTriangle } from 'lucide-react'
import { RESOURCE_TYPES, getTypeInfo, getStatusInfo } from '../constants'
import { resourceApi } from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchResources() }, [])

  const fetchResources = async () => {
    try {
      setLoading(true); setError(null)
      const response = await resourceApi.getAll()
      setResources(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to the server. Make sure the backend is running on port 8080.')
    } finally { setLoading(false) }
  }

  const stats = {
    totalResources: resources.length,
    activeResources: resources.filter((r) => r.status === 'ACTIVE').length,
    outOfService: resources.filter((r) => r.status === 'OUT_OF_SERVICE').length,
    maintenance: resources.filter((r) => r.status === 'MAINTENANCE').length,
    totalCapacity: resources.reduce((sum, r) => sum + (r.capacity || 0), 0),
  }

  const typeCards = RESOURCE_TYPES.map((t) => ({
    ...t, count: resources.filter((r) => r.type === t.value).length,
  }))

  const statCards = [
    { label: 'Total Resources', value: stats.totalResources, icon: '📦', sub: 'Across all categories' },
    { label: 'Active', value: stats.activeResources, icon: '✅', sub: 'Ready for booking' },
    { label: 'Out of Service', value: stats.outOfService, icon: '🔧', sub: 'Unavailable' },
    { label: 'Total Capacity', value: stats.totalCapacity.toLocaleString(), icon: '👥', sub: 'Combined seating' },
  ]

  const recentResources = [...resources].sort((a, b) => b.resourceId - a.resourceId).slice(0, 6)

  if (loading) {
    return (
      <>
        <div className="px-8 py-7 border-b border-border bg-surface-dark/60 backdrop-blur-xl sticky top-0 z-50">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-text-secondary text-sm">Welcome back — here's an overview of your campus facilities</p>
        </div>
        <div className="flex items-center justify-center py-20 gap-3 text-text-muted">
          <Loader2 size={24} className="animate-spin" /><span>Loading resources...</span>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="px-8 py-7 border-b border-border bg-surface-dark/60 backdrop-blur-xl sticky top-0 z-50">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-text-secondary text-sm">Welcome back — here's an overview of your campus facilities</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
          <AlertTriangle size={48} className="text-accent-red opacity-70" />
          <h3 className="text-lg text-text-secondary">Connection Error</h3>
          <p className="text-sm text-text-muted max-w-[500px]">{error}</p>
          <button className="btn-primary" onClick={fetchResources}>Retry</button>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="px-8 py-7 border-b border-border bg-surface-dark/60 backdrop-blur-xl sticky top-0 z-50">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-text-secondary text-sm">Welcome back — here's an overview of your campus facilities</p>
      </div>

      <div className="px-8 py-7 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8" id="stats-grid">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-border-hover hover:-translate-y-0.5 hover:shadow-glow transition-all duration-250 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] text-text-muted font-medium uppercase tracking-wider">{card.label}</span>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px]">{card.icon}</div>
              </div>
              <div className="text-4xl font-extrabold font-mono gradient-text leading-none mb-1.5">{card.value}</div>
              <div className="text-xs text-text-muted">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Browse by Type */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h3 className="text-xl font-bold">Browse by Type</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8" id="type-cards-grid">
          {typeCards.map((tc) => (
            <div
              key={tc.value}
              className="glass-card rounded-2xl p-5 group animate-fade-in-up"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: `${tc.color}18`, color: tc.color }}>
                {tc.icon}
              </div>
              <h4 className="text-sm font-bold mb-0.5">{tc.label}</h4>
              <p className="text-xs text-text-muted">{tc.count} resource{tc.count !== 1 ? 's' : ''}</p>
            </div>
          ))}
        </div>

        {/* Distribution & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={20} />
              <h3 className="text-xl font-bold">Distribution</h3>
            </div>
            <div className="flex flex-col gap-3.5">
              {typeCards.map((tc) => {
                const pct = stats.totalResources > 0 ? Math.round((tc.count / stats.totalResources) * 100) : 0
                return (
                  <div key={tc.value} className="glass-card rounded-xl p-4 animate-fade-in-up">
                    <div className="flex justify-between mb-2">
                      <span className="text-[13px] font-semibold text-text-primary">{tc.icon} {tc.label}</span>
                      <span className="text-[13px] text-text-muted">{tc.count} ({pct}%)</span>
                    </div>
                    <div className="w-full">
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: tc.color }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Activity size={20} />
              <h3 className="text-xl font-bold">Recent Resources</h3>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              {recentResources.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-sm">
                  No resources yet. Add one from the Admin Panel.
                </div>
              ) : (
                recentResources.map((r) => {
                  const typeInfo = getTypeInfo(r.type)
                  const statusInfo = getStatusInfo(r.status)
                  return (
                    <div key={r.resourceId} className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-b-0 animate-fade-in-up">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: typeInfo.color }} />
                      <span className="text-sm text-text-secondary flex-1 min-w-0 truncate">
                        <strong className="text-text-primary">{r.name}</strong> — {typeInfo.label} · {r.location}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: `${statusInfo.color}18`, color: statusInfo.color, border: `1px solid ${statusInfo.color}33` }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
