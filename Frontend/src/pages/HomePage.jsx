import { useState, useEffect } from 'react'
import campusImg from '../assets/campus.jpg'
import lectureHallImg from '../assets/lecture-hall.jpg'
import computerLabImg from '../assets/computer-lab.jpg'
import meetingRoomImg from '../assets/meeting-room.jpg'
import campusImg1 from '../assets/campus1.jpg'
import campusImg2 from '../assets/campus2.jpg'
import campusImg3 from '../assets/campus3.jpg'
import catalogueImg from '../assets/catalogue.png'
import smartFinderImg from '../assets/smart-finder.png'
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
  MousePointer2,
} from 'lucide-react'
import { resourceApi } from '../services/api'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, active: 0, capacity: 0 })
  const [bgIndex, setBgIndex] = useState(0)
  const images = [campusImg, campusImg1, campusImg2, campusImg3, lectureHallImg]

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
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
    { icon: <Settings size={28} />, title: 'Resource Management', desc: 'Full CRUD operations for administrators to add, update, and remove resources with an intuitive management panel.' },
    { icon: <Clock size={28} />, title: 'Availability Windows', desc: 'Define precise availability hours for each resource to streamline scheduling and prevent booking conflicts.' },
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden light-theme">
      {/* Navbar */}
      <Navbar />

      <section
        className="min-h-[85vh] flex items-center justify-center px-5 md:px-12 pt-[100px] pb-20 relative text-center overflow-hidden"
        id="home-hero"
      >
        {/* Animated Background Slides */}
        {images.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: i === bgIndex ? 1 : 0
            }}
          />
        ))}

        {/* Advanced Overlay */}
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900/80 pointer-events-none"
        />

        {/* Glow orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
        />

        <div className="max-w-[720px] relative z-[2] w-full">
          <div className="glass-card-premium p-6 md:p-10 rounded-[32px] animate-float relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-[12px] font-bold mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              SMART CAMPUS OPERATIONS HUB
            </div>

            <h2 className="text-3xl md:text-[38px] font-black leading-[1.1] mb-4 tracking-tight text-white">
              Revolutionize Your<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Facility Experience</span>
            </h2>

            <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-[500px] mx-auto mb-2 font-medium">
              Seamlessly discover, track, and manage all your physical assets
              and spaces through a single unified interface designed for the future.
            </p>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2] text-white/40 flex flex-col items-center gap-2 animate-pulse">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explore More</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Decorative Middle Glow 1 */}
      <div className="absolute top-[80vh] right-[5%] w-[40%] h-[400px] rounded-full opacity-5 blur-[120px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
      />

      {/* Stats Banner */}
      <section className="relative px-5 md:px-12 py-16 -mt-16 z-[5] max-w-7xl mx-auto" id="home-stats">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: stats.total, label: 'Total Resources', icon: <Layers size={20} /> },
            { num: stats.active, label: 'Active & Bookable', icon: <Zap size={20} /> },
            { num: stats.capacity.toLocaleString(), label: 'Total Capacity', icon: <Users size={20} /> },
            { num: '24/7', label: 'System Uptime', icon: <Clock size={20} /> },
          ].map((s, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group cursor-default transition-all hover:-translate-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
                {s.icon}
              </div>
              <div className="text-3xl font-black text-slate-900 mb-1 leading-none">{s.num}</div>
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Decorative Middle Glow 2 */}
      <div className="absolute top-[160vh] left-[5%] w-[45%] h-[500px] rounded-full opacity-[0.03] blur-[100px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
      />

      {/* Features */}
      <section className="px-5 md:px-12 py-24 md:py-32 max-w-7xl mx-auto" id="home-features">
        <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20 animate-fade-in-up">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
              <Zap size={14} /> Core Performance
            </div>
            <h2 className="text-4xl md:text-[52px] font-black text-slate-900 leading-[1.1] tracking-tight">
              Future-proof your <br />
              <span className="text-blue-500">campus management.</span>
            </h2>
          </div>
          <p className="text-lg text-slate-500 max-w-[440px] leading-relaxed font-medium">
            SpaceLink is more than a database; it is an intelligent orchestrator for your university physical infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-10 bg-white rounded-[32px] border border-slate-100 perspective-card group animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-blue-500 mb-8 bg-blue-50 border border-blue-100 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-sm">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Decorative Middle Glow 3 */}
      <div className="absolute top-[280vh] right-[-10%] w-[50%] h-[600px] rounded-full opacity-[0.04] blur-[150px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />

      {/* Facility Showcase */}
      <section className="px-5 md:px-12 py-24 md:py-32 bg-slate-50 relative overflow-hidden" id="facility-showcase">
        {/* Subtle background texture or glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-[1]">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
              <Building2 size={16} /> Campus Icons
            </div>
            <h2 className="text-4xl md:text-[52px] font-black text-slate-900 mb-6 tracking-tight">Explore Our Facilities</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Step into high-performance environments designed for future-shaping research,
              collaboration, and intensive learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                img: lectureHallImg,
                title: 'Modern Lecture Halls',
                desc: 'Intelligent spaces with 360° audio and multi-screen projection.',
                icon: <Users size={20} />
              },
              {
                img: computerLabImg,
                title: 'High-Tech Computer Labs',
                desc: 'Next-gen workstations equipped for AI development and data analysis.',
                icon: <BarChart3 size={20} />
              },
              {
                img: meetingRoomImg,
                title: 'Professional Meeting Rooms',
                desc: 'Quiet zones optimized for high-level group strategy and coordination.',
                icon: <CalendarCheck size={20} />
              }
            ].map((facility, i) => (
              <div
                key={i}
                className="group relative rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/60 animate-fade-in-up border border-white"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Image Container */}
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={facility.img}
                    alt={facility.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* High contrast gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/30 to-slate-900/90" />
                </div>

                {/* Floating Content Tile */}
                <div className="absolute inset-x-5 bottom-5 glass-card-premium p-7 rounded-[32px] border-white/30 group-hover:-translate-y-2 transition-transform duration-500 backdrop-blur-3xl bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                    {facility.icon}
                  </div>

                  {/* Bypass global light-theme color with inline style */}
                  <div
                    className="text-xl font-black mb-2 tracking-tight drop-shadow-md"
                    style={{ color: 'white' }}
                  >
                    {facility.title}
                  </div>

                  <div
                    className="text-xs font-medium leading-relaxed opacity-90 drop-shadow-sm"
                    style={{ color: '#e2e8f0' }}
                  >
                    {facility.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 flex justify-center">
            <Link
              to="/catalogue"
              className="group/btn relative px-12 py-5 bg-blue-600 text-white font-bold rounded-2xl transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/40 flex items-center gap-3 no-underline"
            >
              Explore Full Catalogue
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all group-hover/btn:bg-white/20">
                <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-1" />
              </div>
            </Link>
          </div>
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

      {/* Quick Actions Hub Replacement */}
      <section className="px-5 md:px-12 py-24 md:py-32 relative overflow-hidden" id="quick-actions">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[140px] opacity-[0.05] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto relative z-[1]">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live System Status: All Facilities Online
            </div>
            <h2 className="text-3xl md:text-[45px] font-black text-slate-900 mb-6 tracking-tight">What would you like to do today?</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Experience the future of campus management. Access core modules instantly through our high-performance portals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {[
              {
                title: "Browse Catalogue",
                desc: "Explore all available campus facilities and equipment in real-time.",
                icon: <Search size={22} />,
                img: catalogueImg,
                link: "/catalogue",
                accent: "from-blue-600/20 to-blue-600/5"
              },
              {
                title: "Smart Lab Finder",
                desc: "Get AI-driven recommendations based on your capacity and tech needs.",
                icon: <Zap size={22} />,
                img: smartFinderImg,
                link: "/find-best-lab",
                accent: "from-cyan-500/20 to-cyan-500/5"
              }
            ].map((action, i) => (
              <Link
                key={i}
                to={action.link}
                className="group relative h-[450px] rounded-[40px] overflow-hidden border border-slate-200/50 hover:border-blue-500/40 transition-all duration-700 hover:-translate-y-3 no-underline block animate-fade-in-up shadow-lg shadow-slate-200/40"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={action.img}
                    alt={action.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* High contrast overlay for text legibility */}
                  <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-black/70 to-black/95 z-[1]`} />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-[2] p-8 md:p-12 flex flex-col justify-end">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 backdrop-blur-xl border border-blue-400/40 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-blue-500/20">
                    {action.icon}
                  </div>

                  {/* Using h4 and explicit white to bypass global light-theme h3:!important rule */}
                  <h4
                    className="text-3xl font-black mb-4 tracking-tight group-hover:text-blue-400 transition-all uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                    style={{ color: 'white', textDecoration: 'none' }}
                  >
                    {action.title}
                  </h4>

                  <div
                    className="text-base font-medium leading-relaxed mb-8 opacity-100 transition-all duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
                    style={{ color: '#ffffff' }}
                  >
                    {action.desc}
                  </div>

                  <div className="flex items-center gap-3 text-white font-bold text-sm transition-all">
                    <span className="px-6 py-3 rounded-full bg-blue-600 text-white border border-blue-400/30 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                      OPEN MODULE
                    </span>
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>

                {/* Top Shine Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${action.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
