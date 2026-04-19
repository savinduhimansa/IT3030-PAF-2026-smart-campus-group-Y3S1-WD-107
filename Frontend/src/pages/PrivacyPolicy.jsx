import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Lock, Eye, FileText, ChevronRight } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "Data Collection",
      icon: <Eye className="text-blue-500" />,
      content: "We collect information you provide directly to us when you create an account, such as your university email, full name, and department. We also collect data related to your campus resource bookings and usage patterns to improve our capacity planning algorithms."
    },
    {
      title: "How We Use Your Data",
      icon: <FileText className="text-cyan-500" />,
      content: "Your data is used to manage bookings, prevent scheduling conflicts, and provide you with personalized resource recommendations. Administrators use anonymized, aggregated data to make informed decisions about campus infrastructure maintenance and upgrades."
    },
    {
      title: "Data Security",
      icon: <Lock className="text-indigo-500" />,
      content: "SpaceLink employs industry-standard encryption protocols (SSL/TLS) for data in transit and at rest. Access to personal data is strictly limited to authorized personnel based on the principle of least privilege."
    },
    {
      title: "Campus Location Services",
      icon: <Shield className="text-emerald-500" />,
      content: "Our Smart Lab Finder may request location access to find the nearest available facilities. This data is processed locally whenever possible and is never stored permanently unless required for a specific booking transaction."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden light-theme">
      <Navbar />

      <main className="relative pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto z-10">
        {/* Animated Background Flows (Same as HomePage) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.08] blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[400px] rounded-full opacity-[0.06] blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
        />

        <header className="mb-16 animate-in-up text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
            <Shield size={14} /> Legal Center
          </div>
          <h1 className="text-4xl md:text-[52px] font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
            Privacy <span className="text-blue-500">Policy</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed font-medium mx-auto md:mx-0">
            At SpaceLink, we are committed to protecting your personal data and your privacy on campus. 
            This policy outlines how we handle your information within our smart ecosystem.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 text-sm font-bold uppercase tracking-widest">
            <span>Last Updated: April 19, 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span>v1.2.0</span>
          </div>
        </header>

        <section className="grid gap-8">
          {sections.map((section, idx) => (
            <div 
              key={idx}
              className="p-10 bg-white rounded-[32px] border border-slate-100 perspective-card group animate-fade-in-up shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100/50 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-sm shrink-0">
                  {React.cloneElement(section.icon, { className: 'w-7 h-7 transition-colors group-hover:text-white' })}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-500 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-base">
                    {section.content}
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
