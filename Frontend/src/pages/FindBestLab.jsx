import React, { useState, useEffect } from 'react';
import { resourceApi } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Users, Clock, Sparkles, Search, ChevronRight, AlertCircle } from 'lucide-react';
import { getUnitLabel } from '../constants';

const RESOURCE_TYPE_OPTIONS = [
  { label: 'Any Type', value: '' },
  { label: 'Lecture Hall', value: 'LECTURE_HALL' },
  { label: 'Lab', value: 'LAB' },
  { label: 'Meeting Room', value: 'MEETING_ROOM' },
  { label: 'Projector', value: 'PROJECTOR' },
  { label: 'Camera', value: 'CAMERA' },
  { label: 'Equipment', value: 'EQUIPMENT' },
];

export default function FindBestLab() {
  const [minCapacity, setMinCapacity] = useState('');
  const [requiredTime, setRequiredTime] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '' });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const validateForm = () => {
    const newErrors = {};
    if (!minCapacity) {
      newErrors.minCapacity = 'Capacity is required';
    } else {
      const cap = Number(minCapacity);
      if (isNaN(cap) || cap < 1 || !Number.isInteger(cap)) {
        newErrors.minCapacity = 'Must be a positive whole number';
      }
    }

    if (!requiredTime) {
      newErrors.requiredTime = 'Time selection is required';
    } else {
      const [hours, minutes] = requiredTime.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;
      const minTime = 8 * 60; // 08:00
      const maxTime = 18 * 60; // 18:00

      if (timeInMinutes < minTime || timeInMinutes > maxTime) {
        newErrors.requiredTime = 'Selection must be 08:00 - 18:00';
      }
    }

    return newErrors;
  };

  const handleInputChange = (field, setter, value) => {
    let finalValue = value;
    if (field === 'minCapacity' && value !== '') {
      const num = Number(value);
      if (num < 1) finalValue = '1';
    }
    
    setter(finalValue);
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const rankResources = (resources, requestedType, requestedCapacity) => {
    const capacityNeed = Number(requestedCapacity);

    return [...resources]
      .filter((resource) => resource?.isBookable !== false)
      .sort((a, b) => {
        const aTypeMismatch = requestedType && a.type !== requestedType ? 1 : 0;
        const bTypeMismatch = requestedType && b.type !== requestedType ? 1 : 0;
        if (aTypeMismatch !== bTypeMismatch) return aTypeMismatch - bTypeMismatch;

        const aCapacityGap = Math.abs((a.capacity ?? 0) - capacityNeed);
        const bCapacityGap = Math.abs((b.capacity ?? 0) - capacityNeed);
        if (aCapacityGap !== bCapacityGap) return aCapacityGap - bCapacityGap;

        return (a.name || '').localeCompare(b.name || '');
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    setError('');
    setRecommendations([]);

    const capacityValue = Number(minCapacity);

    try {
      const params = {
        minCapacity: capacityValue,
        availableFrom: requiredTime,
        availableTo: requiredTime,
        status: 'ACTIVE',
      };
      if (type) params.type = type;

      const res = await resourceApi.getAll(params);
      const ranked = rankResources(res.data || [], type, capacityValue);
      setRecommendations(ranked);
      if (ranked.length === 0) setError('No matching resources found for those criteria.');
    } catch (err) {
      setError('Failed to fetch recommendations. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="light-theme min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-grow">
        <div style={{ height: '72px' }} />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4F8CFF] text-[11px] font-bold uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Smart Recommendation
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Find the Best Lab for Your Session
          </h1>
          <p className="text-[#334155] max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Tell us your capacity and time window. Our AI-driven system will score and recommend the most suitable campus resource for you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">Minimum Capacity</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#4F8CFF] transition-colors" size={18} />
                  <input
                    type="number"
                    value={minCapacity}
                    onChange={e => handleInputChange('minCapacity', setMinCapacity, e.target.value)}
                    placeholder="e.g. 50"
                    onKeyDown={(e) => {
                      if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
                    }}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl text-[#1E293B] font-medium focus:bg-white focus:ring-2 transition-all placeholder:text-[#94A3B8] outline-none ${
                      fieldErrors.minCapacity 
                        ? 'border-red-400 focus:ring-red-100 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-blue-100 focus:border-[#4F8CFF]'
                    }`}
                  />
                </div>
                {fieldErrors.minCapacity && (
                  <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in">
                    {fieldErrors.minCapacity}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">Required Time</label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#4F8CFF] transition-colors" size={18} />
                  <input
                    type="time"
                    value={requiredTime}
                    onChange={e => handleInputChange('requiredTime', setRequiredTime, e.target.value)}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl text-[#1E293B] font-medium focus:bg-white focus:ring-2 transition-all outline-none ${
                        fieldErrors.requiredTime 
                          ? 'border-red-400 focus:ring-red-100 focus:border-red-500' 
                          : 'border-slate-200 focus:ring-blue-100 focus:border-[#4F8CFF]'
                      }`}
                  />
                </div>
                {fieldErrors.requiredTime && (
                  <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in">
                    {fieldErrors.requiredTime}
                  </span>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-[#334155] uppercase tracking-wider">Resource Type (optional)</label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#4F8CFF] transition-colors" size={18} />
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#4F8CFF] outline-none transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                  >
                    {RESOURCE_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="mt-4 px-6 py-4 bg-blue-gradient text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
              >
                {loading ? 'Analyzing Resources...' : 'Find Best Resource'}
              </button>
            </form>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto w-full bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 font-medium text-center">
              {error}
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="mt-8 animate-in">
              <div className="flex justify-between items-baseline mb-6">
                <h2 className="text-2xl font-bold text-[#1E293B]">Recommended Resources</h2>
                <span className="text-[#4F8CFF] text-sm font-bold flex items-center gap-1.5">
                   <Sparkles size={14} /> Top match highlighted
                </span>
              </div>
              <div className="grid gap-6">
                {recommendations.map((r, idx) => (
                  <div
                    key={r.resourceId}
                    className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                      idx === 0 
                        ? 'bg-green-50/50 border-green-200 shadow-xl shadow-green-500/5 hover:-translate-y-1' 
                        : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1'
                    }`}
                  >
                    {idx === 0 && (
                      <span className="absolute top-6 right-8 bg-[#10B981] text-white rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20">
                        Top Recommendation
                      </span>
                    )}
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-[#1E293B] mb-2">{r.name}</div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] bg-slate-100 rounded-full px-3 py-1 mb-6">
                          {r.type.replace('_', ' ')}
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Capacity</span>
                            <span className="text-[#334155] font-bold flex items-center gap-2">
                              <Users size={14} className="text-[#4F8CFF]" /> {r.capacity} {getUnitLabel(r.type, r.capacity)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Location</span>
                            <span className="text-[#334155] font-bold flex items-center gap-2">
                              <MapPin size={14} className="text-[#4F8CFF]" /> {r.location}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Availability</span>
                            <span className="text-[#334155] font-bold flex items-center gap-2">
                              <Clock size={14} className="text-[#4F8CFF]" /> {r.availableFrom} - {r.availableTo}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Status</span>
                            <span className={`font-bold flex items-center gap-2 ${r.status === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'}`}>
                              <span className={`w-2 h-2 rounded-full ${r.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                              {r.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[#334155] font-bold text-sm hover:bg-slate-50 hover:border-[#4F8CFF] hover:text-[#4F8CFF] transition-all flex items-center justify-center gap-2 group"
                        onClick={() => window.location.href = `/catalogue?id=${r.resourceId}`}
                      >
                        View Details <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      <Footer />

      {toast.visible && (
        <div className="toast-notification">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
              <AlertCircle size={18} />
            </div>
            <span className="pr-2">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
