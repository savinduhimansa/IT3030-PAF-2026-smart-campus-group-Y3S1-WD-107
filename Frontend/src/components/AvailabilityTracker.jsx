import { useState, useEffect } from 'react'
import { Calendar, Search, Clock, CheckCircle, XCircle, ChevronRight, Activity, Info } from 'lucide-react'
import { getBookedSlots, getFreeSlots, checkAvailability } from '../services/api'
import { format, addDays } from 'date-fns'

export default function AvailabilityTracker({ resourceId, resourceName, availableFrom, availableTo }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [bookedSlots, setBookedSlots] = useState([])
  const [freeSlots, setFreeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [checkForm, setCheckForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), startTime: '', endTime: '' })
  const [checkResult, setCheckResult] = useState(null)
  const [activeTab, setActiveTab] = useState('visual') // 'visual' or 'search'

  const fetchData = async (date) => {
    setLoading(true)
    try {
      const [booked, free] = await Promise.all([
        getBookedSlots(resourceId, date),
        getFreeSlots(resourceId, date)
      ])
      setBookedSlots(booked)
      setFreeSlots(free)
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedDate)
  }, [resourceId, selectedDate])

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!checkForm.startTime || !checkForm.endTime) return
    setLoading(true)
    try {
      const result = await checkAvailability(resourceId, checkForm.date, checkForm.startTime, checkForm.endTime)
      setCheckResult({ available: result.available, message: result.available ? 'This slot is available!' : 'This slot is already booked.' })
    } catch (error) {
      setCheckResult({ available: false, message: 'Error checking availability.' })
    } finally {
      setLoading(false)
    }
  }

  // Generate hour marks for the timeline
  const startHour = availableFrom ? parseInt(availableFrom.split(':')[0]) : 8
  const endHour = availableTo ? parseInt(availableTo.split(':')[0]) : 20
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  return (
    <div className="availability-tracker-container mt-8 p-1 rounded-[32px] bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
      {/* Tab Header */}
      <div className="flex p-2 gap-2 bg-white rounded-[28px] mb-1">
        <button
          onClick={() => setActiveTab('visual')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black transition-all duration-300 ${activeTab === 'visual' ? 'bg-[#1E293B] text-white shadow-lg' : 'text-[#64748B] hover:bg-slate-50'}`}
        >
          <Activity size={14} /> Schedule View
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-black transition-all duration-300 ${activeTab === 'search' ? 'bg-[#1E293B] text-white shadow-lg' : 'text-[#64748B] hover:bg-slate-50'}`}
        >
          <Search size={14} /> Check Specific Time
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'visual' ? (
          <div className="animate-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <h5 className="font-black text-[#1E293B] text-sm">Resource Schedule</h5>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{format(new Date(selectedDate), 'EEEE, MMMM do')}</p>
                </div>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#1E293B] outline-none focus:border-blue-500 transition-all hover:bg-slate-50 cursor-pointer"
              />
            </div>

            {/* Timeline Visualization */}
            <div className="relative mt-10 mb-8 min-h-[140px]">
              {/* Hour Grid */}
              <div className="flex justify-between relative px-2">
                {hours.map((hour) => (
                  <div key={hour} className="flex flex-col items-center gap-4 group">
                    <div className="h-2 w-px bg-slate-200 group-hover:h-3 group-hover:bg-blue-400 transition-all" />
                    <span className="text-[10px] font-black text-[#94A3B8] group-hover:text-[#1E293B] transition-colors">
                      {hour > 12 ? `${hour - 12}P` : `${hour}A`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Booking Progress Bar */}
              <div className="absolute top-1 left-0 right-0 h-4 bg-slate-200/50 rounded-full overflow-hidden blur-[1px] opacity-50" />
              <div className="absolute top-0 left-0 right-0 h-6 bg-slate-100 rounded-full border border-slate-200 overflow-hidden shadow-inner">
                {/* Booked Slots Overlay */}
                {bookedSlots.map((slot, i) => {
                  const sParts = slot.startTime.split(':')
                  const eParts = slot.endTime.split(':')
                  const sMin = parseInt(sParts[0]) * 60 + parseInt(sParts[1])
                  const eMin = parseInt(eParts[0]) * 60 + parseInt(eParts[1])
                  const totalRangeMin = (endHour - startHour) * 60
                  const left = ((sMin - startHour * 60) / totalRangeMin) * 100
                  const width = ((eMin - sMin) / totalRangeMin) * 100

                  return (
                    <div
                      key={i}
                      className="absolute h-full bg-gradient-to-r from-red-500 to-rose-600 group cursor-help transition-all hover:brightness-110"
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`Booked: ${slot.startTime} - ${slot.endTime} (${slot.purpose || 'Occupied'})`}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-12 flex items-center gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-200" />
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Available</span>
                </div>
              </div>
            </div>

            {/* List of Free Slots */}
            <div className="space-y-3">
              <h6 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] flex items-center gap-2">
                Available Windows
                <div className="flex-1 h-px bg-slate-200/60" />
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {freeSlots.length > 0 ? (
                  freeSlots.map((slot, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:border-green-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                          <CheckCircle size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#1E293B]">{slot.startTime} — {slot.endTime}</p>
                          <p className="text-[9px] font-bold text-[#94A3B8] uppercase">Open Window</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-green-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-6 text-center bg-rose-50 rounded-[28px] border border-rose-100">
                    <XCircle className="mx-auto mb-3 text-rose-500" size={32} />
                    <p className="text-sm font-black text-rose-900">Fully Booked</p>
                    <p className="text-xs font-bold text-rose-500 opacity-70">No free slots found for this date.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in">
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="date"
                      value={checkForm.date}
                      onChange={(e) => setCheckForm({ ...checkForm, date: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-[#1E293B] outline-none focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="time"
                      value={checkForm.startTime}
                      onChange={(e) => setCheckForm({ ...checkForm, startTime: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-[#1E293B] outline-none focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="time"
                      value={checkForm.endTime}
                      onChange={(e) => setCheckForm({ ...checkForm, endTime: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-[#1E293B] outline-none focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1E293B] text-white rounded-[24px] text-sm font-black shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? 'Analyzing Availability...' : 'Check Availability Now'}
              </button>
            </form>

            {checkResult && (
              <div className={`mt-8 p-6 rounded-[32px] border-2 animate-in-up flex items-center gap-6 ${checkResult.available ? 'bg-green-50 border-green-100 text-green-900 shadow-green-100/50' : 'bg-rose-50 border-rose-100 text-rose-900 shadow-rose-100/50'} shadow-2xl`}>
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shrink-0 ${checkResult.available ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'} scale-110 shadow-lg`}>
                  {checkResult.available ? <CheckCircle size={32} strokeWidth={2.5} /> : <XCircle size={32} strokeWidth={2.5} />}
                </div>
                <div>
                  <h4 className="text-xl font-black mb-1">{checkResult.available ? 'Spot Available!' : 'Slot Occupied'}</h4>
                  <p className="text-sm font-bold opacity-70 italic">{checkResult.message}</p>
                </div>
              </div>
            )}

            {!checkResult && (
              <div className="mt-8 p-8 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center text-center gap-3 opacity-60">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Info size={24} />
                </div>
                <p className="text-xs font-black text-[#64748B] uppercase tracking-wider">Select a time to check resource availability</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
