import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, BarChart3, Loader2, AlertTriangle, Users, MapPin, Clock, Plus, Zap, TrendingUp, Calendar, ChevronRight } from 'lucide-react'
import { RESOURCE_TYPES, getTypeInfo, getStatusInfo, getUnitLabel } from '../constants'
import { resourceApi, getAllBookings } from '../services/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchResources()
    fetchBookings()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true); setError(null)
      const response = await resourceApi.getAll()
      setResources(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to the server. Make sure the backend is running on port 8080.')
    } finally { setLoading(false) }
  }

  const fetchBookings = async () => {
    try {
      const uId = localStorage.getItem('userId')
      const uRole = localStorage.getItem('role') || 'USER'
      if (uId) {
        const data = await getAllBookings(Number(uId), uRole)
        setBookings(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch bookings for analytics', err)
    }
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
    { label: 'Total Resources', value: stats.totalResources, icon: '📦', sub: 'Across all categories', color: 'blue' },
    { label: 'Active', value: stats.activeResources, icon: '✅', sub: 'Ready for booking', color: 'green' },
    { label: 'Out of Service', value: stats.outOfService, icon: '🔧', sub: 'Currently unavailable', color: 'red' },
    { label: 'Total Capacity', value: stats.totalCapacity.toLocaleString(), icon: '👥', sub: 'Combined seating', color: 'purple' },
  ]

  const recentResources = [...resources].sort((a, b) => b.resourceId - a.resourceId).slice(0, 6)

  // Analytics logic
  const topResources = (() => {
    const counts = bookings.reduce((acc, b) => {
      acc[b.resourceId] = (acc[b.resourceId] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => {
        const res = resources.find(r => r.resourceId === Number(id));
        return { 
          name: res?.name || `Unknown Asset (${id})`, 
          count, 
          type: res?.type || 'UNKNOWN' 
        };
      });
  })();

  const peakHours = (() => {
    const hours = new Array(24).fill(0);
    bookings.forEach(b => {
      const date = new Date(b.startTime);
      if (!isNaN(date.getTime())) {
        hours[date.getHours()]++;
      }
    });
    return hours;
  })();

  const maxHourCount = Math.max(...peakHours, 1);

  if (loading) {
    return (
      <div className="light-theme min-h-screen bg-[#F8FAFC]">
        <div className="px-8 py-7 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <h1 className="text-2xl font-bold mb-1 gradient-text">Dashboard</h1>
          <p className="text-[#64748B] text-sm md">Welcome back — here's an overview of your campus facilities</p>
        </div>
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-[#64748B]">
          <Loader2 size={32} className="animate-spin text-[#4F8CFF]" />
          <span className="font-medium">Curating your dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="light-theme min-h-screen bg-[#F8FAFC]">
        <div className="px-8 py-7 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
          <h1 className="text-2xl font-bold mb-1 gradient-text">Dashboard</h1>
          <p className="text-[#64748B] text-sm">Welcome back — here's an overview of your campus facilities</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2">Connection Error</h3>
            <p className="text-[#64748B] max-w-[500px] mb-8 leading-relaxed font-medium">{error}</p>
          </div>
          <button
            className="px-6 py-2.5 bg-blue-gradient text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
            onClick={fetchResources}
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="light-theme min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="px-8 py-7 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1 gradient-text">Dashboard</h1>
          <p className="text-[#64748B] text-sm font-medium">Welcome back — your campus at a glance</p>
        </div>
        <button
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-gradient text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all"
          onClick={() => navigate('/admin')}
        >
          <Plus size={18} /> Add Resource
        </button>
      </div>

      <div className="px-8 py-8 pb-16 max-w-[1600px] mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-50 relative overflow-hidden group hover:border-[#4F8CFF]/30 hover:shadow-md transition-all duration-300 animate-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] text-[#64748B] font-bold uppercase tracking-widest">{card.label}</span>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl group-hover:bg-[#4F8CFF]/10 transition-colors">
                  {card.icon}
                </div>
              </div>
              <div className="text-3xl font-extrabold text-[#1E293B] mb-1">{card.value}</div>
              <div className="text-xs text-[#94A3B8] font-medium">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-1 bg-blue-gradient rounded-full" />
          <h3 className="text-lg font-bold text-[#1E293B]">Quick Assets Overview</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 mb-12">
          {typeCards.map((tc, i) => (
            <div
              key={tc.value}
              className="bg-white rounded-2xl p-5 border border-slate-50 group hover:border-[#4F8CFF]/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 animate-in"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => navigate(`/catalogue?type=${tc.value}`)}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-inner" style={{ background: `${tc.color}10`, color: tc.color }}>
                {tc.icon}
              </div>
              <h4 className="text-sm font-bold text-[#1E293B] mb-0.5">{tc.label}</h4>
              <p className="text-xs text-[#94A3B8] font-bold">{tc.count} items</p>
            </div>
          ))}
        </div>

        {/* Usage Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Top Resources Card */}
          <div className="animate-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-[#4F8CFF]" />
              <h3 className="text-lg font-bold text-[#1E293B]">High-Demand Facilities</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Zap size={120} className="text-blue-600" />
               </div>
               <div className="flex flex-col gap-5 relative z-10">
                 {topResources.length === 0 ? (
                   <div className="py-12 text-center text-[#94A3B8] font-medium italic">No booking trends available yet.</div>
                 ) : (
                   topResources.map((item, idx) => {
                     const typeInfo = getTypeInfo(item.type);
                     return (
                       <div key={idx} className="flex items-center justify-between group cursor-pointer">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform" style={{ background: `${typeInfo.color}10`, color: typeInfo.color }}>
                               {typeInfo.icon}
                            </div>
                            <div>
                               <div className="text-sm font-bold text-[#334155] group-hover:text-[#4F8CFF] transition-colors">{item.name}</div>
                               <div className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">{item.type}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="text-right">
                               <div className="text-sm font-extrabold text-[#1E293B]">{item.count}</div>
                               <div className="text-[9px] text-[#64748B] font-bold uppercase">Bookings</div>
                            </div>
                            <ChevronRight size={16} className="text-slate-200 group-hover:text-[#4F8CFF] group-hover:translate-x-1 transition-all" />
                         </div>
                       </div>
                     )
                   })
                 )}
               </div>
            </div>
          </div>

          {/* Peak Booking Hours Card */}
          <div className="animate-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={20} className="text-[#4F8CFF]" />
              <h3 className="text-lg font-bold text-[#1E293B]">Activity Peak Times</h3>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-50 shadow-sm overflow-hidden">
                <div className="flex items-end justify-between h-40 gap-[3px] px-2 mb-8 relative">
                  {peakHours.map((count, hr) => {
                    const height = (count / maxHourCount) * 100;
                    const isPeak = count === maxHourCount && count > 0;
                    return (
                      <div key={hr} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div 
                          className={`w-full rounded-t-sm transition-all duration-500 relative z-10 ${isPeak ? 'bg-blue-gradient shadow-lg shadow-blue-500/20' : 'bg-[#F1F5F9] group-hover:bg-blue-100'}`}
                          style={{ height: `${Math.max(height, 6)}%` }}
                        >
                           {/* Tooltip */}
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-20 shadow-xl border border-white/10 scale-90 group-hover:scale-100">
                              {hr % 12 || 12} {hr >= 12 ? 'PM' : 'AM'}: {count} bookings
                           </div>
                        </div>
                        {/* Time labels - Absolutely positioned to prevent layout shift */}
                        {hr % 4 === 0 && (
                          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
                            <span className="text-[10px] font-extrabold text-[#94A3B8]">{hr}:00</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between px-2">
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                         <span className="text-[10px] font-bold text-[#64748B] uppercase">Peak Hour</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                         <span className="text-[10px] font-bold text-[#64748B] uppercase">Off-Peak</span>
                      </div>
                   </div>
                   <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      Avg: {Math.round(bookings.length / 24 * 10) / 10} / hr
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* Distribution & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Distribution */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6 text-[#1E293B]">
              <BarChart3 size={20} className="text-[#4F8CFF]" />
              <h3 className="text-lg font-bold">Asset Distribution</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-50 shadow-sm flex flex-col gap-4">
              {typeCards.map((tc) => {
                const pct = stats.totalResources > 0 ? Math.round((tc.count / stats.totalResources) * 100) : 0
                return (
                  <div key={tc.value} className="animate-in">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[13px] font-bold text-[#334155] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: tc.color }} />
                        {tc.label}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-bold">{tc.count} ({pct}%)</span>
                    </div>
                    <div className="w-full">
                      <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div className="h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${pct}%`, background: tc.color }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 mb-6 text-[#1E293B]">
              <Activity size={20} className="text-[#4F8CFF]" />
              <h3 className="text-lg font-bold">Recent Resources</h3>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-50 shadow-sm">
              {recentResources.length === 0 ? (
                <div className="p-12 text-center text-[#94A3B8] font-medium italic">
                  No resources tracked yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentResources.map((r, i) => {
                    const typeInfo = getTypeInfo(r.type)
                    const statusInfo = getStatusInfo(r.status)
                    return (
                      <div
                        key={r.resourceId}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors animate-in"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: `${typeInfo.color}10`, color: typeInfo.color }}>
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-[#1E293B] truncate">{r.name}</div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                              <MapPin size={10} /> {r.location}
                            </span>
                            <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                              <Users size={10} /> {r.capacity} {getUnitLabel(r.type, r.capacity)}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap uppercase tracking-wider ${r.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-600'
                            : r.status === 'OUT_OF_SERVICE'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-amber-100 text-amber-600'
                            }`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
