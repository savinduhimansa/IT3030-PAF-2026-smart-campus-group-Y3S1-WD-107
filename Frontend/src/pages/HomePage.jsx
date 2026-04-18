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
  Target,
  Layers,
  Users,
  CalendarCheck,
} from 'lucide-react'
import { resourceApi } from '../services/api'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, active: 0, capacity: 0 })

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
    { icon: <Settings size={28} />, title: 'Resource Management', desc: 'Full CRUD operations for administrators to add, update, and remove resources with an intuitive management panel.' },
    { icon: <Clock size={28} />, title: 'Availability Windows', desc: 'Define precise availability hours for each resource to streamline scheduling and prevent booking conflicts.' },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden light-theme">
      {/* Navbar */}
      <Navbar />

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
            A unified platform to catalogue, search, and manage all campus resources
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

      {/* About Us Section */}
      <section className="px-5 md:px-12 py-16 md:py-24 max-w-[1200px] mx-auto relative" id="about">
        
        {/* Background glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
        />

        {/* Section Label */}
        <div className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-primary-light mb-3.5">
          <Zap size={14} /> About Us
        </div>

        <h2 className="text-3xl md:text-[38px] font-extrabold mb-4 tracking-tight">
          What is <span className="gradient-text">SpaceLink?</span>
        </h2>
        <p className="text-base text-text-secondary w-full leading-relaxed mb-14 text-justify">
          SpaceLink is a smart campus resource management platform built to modernize the way universities 
          handle their physical assets and spaces. Designed with both students and administrators in mind, 
          SpaceLink centralizes everything from discovering available lecture halls and computer labs to 
          submitting booking requests, tracking approval status, and managing resource availability in real time.
           Whether you're a student looking for a free meeting room between lectures, a lecturer reserving a lab 
           for a practical session, or a facilities manager overseeing the entire campus inventory, SpaceLink gives 
           everyone the visibility and control they need. No more manual spreadsheets, no more double-bookings, no more 
           uncertainty, just a clean, reliable system that keeps your campus running smoothly.
        </p>

        {/* Main Two-Column Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* What is SpaceLink */}
          <div className="p-8 glass-card rounded-2xl relative overflow-hidden group hover:border-border-hover hover:-translate-y-1 hover:shadow-glow transition-all duration-250">
            <div className="absolute top-0 left-0 right-0 h-[3px] gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-primary-light mb-5 bg-primary/10 border border-primary/15">
              <Layers size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">The Platform</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              SpaceLink is a unified smart campus operations hub that enables students, 
              staff, and administrators to discover, manage, and book campus resources 
              with ease.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              From lecture halls and computer labs to projectors and meeting rooms 
              every resource is catalogued, searchable, and bookable through a single 
              intuitive interface.
            </p>
          </div>

          {/* Our Mission */}
          <div className="p-8 glass-card rounded-2xl relative overflow-hidden group hover:border-border-hover hover:-translate-y-1 hover:shadow-glow transition-all duration-250">
            <div className="absolute top-0 left-0 right-0 h-[3px] gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-primary-light mb-5 bg-primary/10 border border-primary/15">
              <Target size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              To eliminate the friction of campus resource management by providing a 
              transparent, conflict-free booking experience that works for everyone — 
              from first-year students to facility administrators.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                'Seamless resource discovery and booking',
                'Real-time availability and status tracking',
                'Transparent admin controls and approvals',
                'Smart conflict detection and prevention',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Three Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Building2 size={24} />,
              title: 'Resource Management',
              desc: 'Full catalogue of campus assets with real-time status tracking — active, maintenance, or out of service.',
            },
            {
              icon: <CalendarCheck size={24} />,
              title: 'Smart Booking',
              desc: 'Request, approve, and manage bookings with built-in conflict detection to prevent double-bookings.',
            },
            {
              icon: <Users size={24} />,
              title: 'Role-Based Access',
              desc: 'Students browse and request. Admins manage and approve. Everyone gets exactly what they need.',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="p-6 glass-card rounded-2xl relative overflow-hidden group hover:border-border-hover hover:-translate-y-1 hover:shadow-glow transition-all duration-250 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-250" />
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-primary-light mb-4 bg-primary/10 border border-primary/15">
                {card.icon}
              </div>
              <h4 className="text-base font-bold mb-2">{card.title}</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{card.desc}</p>
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
            Explore the full catalogue of campus facilities and equipment, or jump into the resources section to manage your resources.
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

      <Footer />
    </div>
  )
}
