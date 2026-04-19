import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Gavel, CheckCircle2, AlertTriangle, Scale, Clock, ChevronRight } from 'lucide-react';

export default function TermsConditions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const terms = [
    {
      title: "User Responsibilities",
      icon: <CheckCircle2 className="text-blue-500" />,
      content: "As a user of SpaceLink, you agree to provide accurate information during registration and booking. You are responsible for maintaining the cleanliness and order of any campus facility you book. Any damage to equipment or spaces must be reported immediately."
    },
    {
      title: "Booking & Cancellation",
      icon: <Clock className="text-cyan-500" />,
      content: "Bookings are subject to availability and administrator approval. Users must adhere to their scheduled time slots. Cancellations should be made at least 2 hours in advance to allow other students or faculty to utilize the space."
    },
    {
      title: "Acceptable Use Policy",
      icon: <AlertTriangle className="text-amber-500" />,
      content: "University resources must be used for educational, research, or approved administrative purposes only. Any attempt to bypass system security, disrupt services, or use resources for unauthorized commercial activities is strictly prohibited."
    },
    {
      title: "Liability & Governance",
      icon: <Scale className="text-indigo-500" />,
      content: "SpaceLink and the University are not liable for personal property left in booked facilities. These terms are governed by university policy and the laws of the jurisdiction in which the campus is located."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden light-theme">
      <Navbar />

      <main className="relative pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto z-10">
        {/* Background Glows (Same as HomePage) */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.08] blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[400px] rounded-full opacity-[0.06] blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />

        <header className="mb-16 animate-in-up text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
            <Gavel size={14} /> Legal Center
          </div>
          <h1 className="text-4xl md:text-[52px] font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
            Terms & <span className="text-cyan-500">Conditions</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium mx-auto md:mx-0">
            Please read these terms carefully before using the SpaceLink platform. 
            By accessing our services, you agree to abide by these campus operational standards.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span>Effective Date: April 19, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span>v2.1.0</span>
          </div>
        </header>

        <section className="space-y-8">
          {terms.map((term, idx) => (
            <div 
              key={idx}
              className="p-10 bg-white rounded-[32px] border border-slate-100 perspective-card group animate-fade-in-up shadow-sm hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-cyan-50 border border-cyan-100/50 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-500 shadow-sm shrink-0">
                  {React.cloneElement(term.icon, { className: 'w-7 h-7 transition-colors group-hover:text-white' })}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-cyan-500 transition-colors">
                    {term.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-base">
                    {term.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>


      </main>

      <Footer />
    </div>
  );
}
