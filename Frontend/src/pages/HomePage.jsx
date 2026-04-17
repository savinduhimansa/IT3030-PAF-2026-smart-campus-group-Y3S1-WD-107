import { useState, useEffect } from 'react'
import campusImg from '../assets/campus.jpg'
import { Link } from 'react-router-dom'
import {
  Zap,
  ArrowRight,
  Search,
  BarChart3,
  Shield,
  Building2,
  Settings,
  Clock,
} from 'lucide-react'
import { resourceApi } from '../services/api'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, capacity: 0 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    resourceApi
      .getAll()
      .then((res) => {
        const data = res.data
        setStats({
          total: data.length,
          active: data.filter((r) => r.status === 'ACTIVE').length,
          capacity: data.reduce((sum, r) => sum + (r.capacity || 0), 0),
        })
      })
      .catch(() => { })
  }, [])

  const features = [
    { icon: <Building2 size={28} />, title: 'Comprehensive Catalogue', desc: 'Maintain a full catalogue of bookable resources — lecture halls, labs, meeting rooms, projectors, cameras, and more.' },
    { icon: <Search size={28} />, title: 'Smart Search & Filters', desc: 'Find the perfect resource instantly with powerful search across name, location, and type with multi-criteria filtering.' },
    { icon: <BarChart3 size={28} />, title: 'Real-Time Dashboard', desc: "Get a bird's eye view of all campus assets with live stats, resource distribution, and availability at a glance." },
    { icon: <Shield size={28} />, title: 'Status Tracking', desc: "Track resource status in real-time — Active, Out of Service, or Maintenance — so you always know what's available." },
    { icon: <Settings size={28} />, title: 'Admin Management', desc: 'Full CRUD operations for administrators to add, update, and remove resources with an intuitive management panel.' },
    { icon: <Clock size={28} />, title: 'Availability Windows', desc: 'Define precise availability hours for each resource to streamline scheduling and prevent booking conflicts.' },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden light-theme">
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 flex items-center justify-between transition-all duration-250 py-4 bg-surface-dark/85 backdrop-blur-2xl border-b border-border"
        id="home-navbar"
      >
        <Link to="/" className="flex items-center gap-3 no-underline text-text-primary">
          <div className="w-[42px] h-[42px] rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Zap size={22} color="white" />
          </div>
          <h1 className="text-[22px] font-extrabold gradient-text">SpaceLink</h1>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
            Home
          </Link>
          <Link to="/about" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
            About
          </Link>
          <Link to="/catalogue" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
            Catalogue
          </Link>
          <Link to="/tickets/new" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 no-underline flex items-center gap-1">
            Report Issue
          </Link>
          <Link to="/bookingDetails" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
            Booking
          </Link>
          <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
            Signup
          </Link>
          <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-glass-hover transition-all duration-150 no-underline">
            Login
          </Link>
        </div>
      </nav>

      <section
        className="min-h-screen flex items-center justify-center px-5 md:px-12 pt-[120px] pb-20 relative text-center"
        id="home-hero"
        style={{
          backgroundImage: `url(${campusImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Overlay for dimming the background image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.65)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        ></div>
        {/* Glow orb */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none animate-hero-glow"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(6,182,212,0.06) 40%, transparent 70%)' }}
        />

        <div className="max-w-[780px] relative z-[2]">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary-light text-[13px] font-semibold mb-7 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse-dot" />
            Smart Campus Operations Hub
          </div>

          <h2 className="text-4xl md:text-[58px] font-black leading-[1.1] mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Manage Your Campus<br />
            <span className="gradient-text">Facilities & Assets</span>
          </h2>

          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[600px] mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            A unified platform to catalogue, search, and manage all campus resources —
            from lecture halls and laboratories to meeting rooms and equipment.
          </p>

          <div className="flex items-center justify-center gap-3.5 flex-wrap animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link to="/catalogue" className="btn-primary text-base px-8 py-3.5 font-bold shadow-glow-strong hover:shadow-glow-xl no-underline">
              Browse Catalogue <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="flex items-center justify-center gap-8 md:gap-12 px-5 md:px-12 py-12 border-t border-b border-border bg-surface/50 flex-wrap" id="home-stats">
        {[
          { num: stats.total, label: 'Total Resources' },
          { num: stats.active, label: 'Active & Bookable' },
          { num: stats.capacity.toLocaleString(), label: 'Total Capacity' },
          { num: '24/7', label: 'System Uptime' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-4xl font-extrabold font-mono gradient-text leading-none mb-1.5">{s.num}</div>
            <div className="text-sm text-text-muted font-medium">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="px-5 md:px-12 py-16 md:py-24 max-w-[1200px] mx-auto" id="home-features">
        <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-primary-light mb-3.5">
          <Zap size={14} /> Features
        </div>
        <h2 className="text-3xl md:text-[38px] font-extrabold mb-4 tracking-tight">
          Everything you need to manage campus resources
        </h2>
        <p className="text-base text-text-secondary max-w-[560px] leading-relaxed mb-12">
          SpaceLink provides a complete toolkit for facilities management — purpose built for universities and smart campuses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-8 glass-card rounded-2xl relative overflow-hidden group hover:border-border-hover hover:-translate-y-1 hover:shadow-lg hover:shadow-glow transition-all duration-250 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-primary-light mb-5 bg-primary/10 border border-primary/15">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-2.5">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 md:px-12 py-16 md:py-24 text-center relative" id="home-cta">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
        />
        <div className="max-w-[700px] mx-auto p-10 md:p-14 glass-card rounded-2xl relative z-[1] backdrop-blur-lg">
          <h3 className="text-2xl md:text-[32px] font-extrabold mb-3.5">Ready to get started?</h3>
          <p className="text-base text-text-secondary mb-8 leading-relaxed">
            Explore the full catalogue of campus facilities and equipment, or jump into the admin panel to manage your resources.
          </p>
          <div className="flex items-center justify-center gap-3.5 flex-wrap">
            <Link to="/catalogue" className="btn-primary text-base px-8 py-3.5 font-bold no-underline">
              Explore Catalogue <ArrowRight size={18} />
            </Link>
            {/* <Link to="/admin" className="btn-secondary text-base px-8 py-3.5 no-underline">
              <Settings size={18} /> Admin Panel
            </Link> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 md:px-12 py-8 border-t border-border flex items-center justify-between flex-wrap gap-4" id="home-footer">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <div className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center">
            <Zap size={14} color="white" />
          </div>
          SpaceLink — Smart Campus Operations Hub
        </div>
        <div className="flex gap-6">
          <Link to="/dashboard" className="text-[13px] text-text-muted hover:text-text-primary transition-colors no-underline">Dashboard</Link>
          <Link to="/catalogue" className="text-[13px] text-text-muted hover:text-text-primary transition-colors no-underline">Catalogue</Link>
          <Link to="/tickets/new" className="text-[13px] text-text-muted hover:text-red-400 transition-colors no-underline">Report Issue</Link>
          <Link to="/admin" className="text-[13px] text-text-muted hover:text-text-primary transition-colors no-underline">Admin</Link>
        </div>
      </footer>
    </div>
  )
}
