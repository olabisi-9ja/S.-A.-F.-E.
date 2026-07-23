import { useState, useEffect } from 'react';
import { ArrowUpRight, Siren, Bot, Wifi, Map, UserX, Bell } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: 'One-Tap SOS',
      description: 'Students trigger a geolocated emergency alert in under 3 seconds — no forms, no menus.',
      icon: <Siren className="w-5 h-5 text-[#3B82F6]" />,
      iconBg: 'bg-[#3B82F6]/10'
    },
    {
      title: 'AI Triage',
      description: 'A fine-tuned NLP microservice classifies each report by type and urgency, routing it to the right team instantly.',
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      iconBg: 'bg-purple-400/10'
    },
    {
      title: 'Offline Mesh',
      description: 'Low-signal? SOS relays peer-to-peer over BLE until it reaches a device with connectivity.',
      icon: <Wifi className="w-5 h-5 text-indigo-400" />,
      iconBg: 'bg-indigo-400/10'
    },
    {
      title: 'Live Dispatch',
      description: 'Security officers get a live Mapbox dashboard with incident queue management and officer assignments.',
      icon: <Map className="w-5 h-5 text-blue-400" />,
      iconBg: 'bg-blue-400/10'
    },
    {
      title: 'Anonymous Mode',
      description: 'Whistle-blower style reports, stripped of all metadata before storage. Untraceable by design.',
      icon: <UserX className="w-5 h-5 text-purple-500" />,
      iconBg: 'bg-purple-500/10'
    },
    {
      title: 'Push Notifications',
      description: 'Real-time status updates from the moment a report is submitted through to resolution.',
      icon: <Bell className="w-5 h-5 text-orange-400" />,
      iconBg: 'bg-orange-400/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070A11] text-zinc-300 font-sans selection:bg-blue-600/30 selection:text-white overflow-x-hidden relative">
      
      {/* Background Dots/Constellation Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" 
           style={{ 
             backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
             backgroundSize: '48px 48px' 
           }}>
      </div>
      
      {/* Soft Blue Glows */}
      <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -translate-y-1/2 -z-0"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none translate-y-1/4 -z-0"></div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#070A11]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-10">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest hover:text-white transition-colors">
                &lt; PORTFOLIO
              </span>
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 font-bold text-sm tracking-wide text-white">
              Olabisi Adigun
            </div>
            
            <div className="flex items-center">
              <button 
                className="text-[10px] font-mono tracking-widest text-zinc-400 hover:text-white transition-colors border border-zinc-800 rounded-full px-4 py-1.5 hover:bg-zinc-900 flex items-center gap-2"
              >
                <span className="text-zinc-500">*</span>
                LIGHT
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 lg:pt-56 lg:pb-32 flex flex-col justify-center min-h-screen z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-5xl">
          <h1 className="text-7xl md:text-[9rem] lg:text-[11rem] font-bold text-[#F3F4F6] tracking-tighter leading-[0.85] mb-8 uppercase" style={{ fontFamily: '"Outfit", system-ui, -apple-system, sans-serif' }}>
            S.A.F.E.<br />
            Campus
          </h1>
          
          <div className="max-w-xl mb-12">
            <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-light">
              Smart Alert and Field Emergency — a <strong className="text-white font-medium">campus-wide safety platform</strong> built for KWASU, with AI triage, real-time dispatch, and offline mesh networking.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-12 mt-16">
            <button 
              onClick={() => onNavigate('login')}
              className="px-8 py-3.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 group"
            >
              <span>View Live Platform</span>
              <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            
            <div className="flex flex-wrap items-end gap-12 md:gap-16">
              <div>
                <div className="text-3xl font-bold text-white mb-1">&lt;3s</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">SOS Trigger</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">3</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Redundancy Paths</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">AI</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Triage Engine</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <section className="py-32 relative z-10 bg-[#0A0D15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <div className="text-blue-500 font-mono text-[10px] tracking-widest uppercase mb-8 flex items-center gap-4">
                <span className="font-bold">01</span>
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                <span>Student App</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8 leading-[1.1]" style={{ fontFamily: '"Outfit", system-ui, -apple-system, sans-serif' }}>
                Emergency response in your pocket.
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg font-light">
                The student-facing app is built for speed. The SOS button is always one tap away — no authentication required in an emergency.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {['React Native', 'Expo', 'BLE Mesh', 'Expo Location'].map(tech => (
                  <div key={tech} className="px-5 py-2 rounded-full border border-zinc-800 bg-transparent text-xs font-mono text-zinc-500">
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup CSS */}
            <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
              {/* Glow Behind Phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[80px]"></div>
              
              <div className="relative w-[280px] h-[580px] bg-[#16181D] rounded-[45px] border-[8px] border-[#22252C] shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 mx-auto lg:mr-8">
                {/* Phone Notch/Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#000000] rounded-full z-20"></div>
                
                {/* Phone Status Bar */}
                <div className="absolute top-5 left-6 text-[10px] text-zinc-500 font-medium z-20">9:41</div>
                <div className="absolute top-5 right-6 flex items-center gap-1 z-20">
                  <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                </div>

                {/* Background gradient for the phone */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1E2128] to-[#12141A]"></div>

                {/* SOS Button Area */}
                <div className="relative w-full aspect-square flex items-center justify-center mt-12">
                  {/* Expanding Rings */}
                  <div className="absolute inset-[-10px] bg-[#FF3B30]/5 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 bg-[#FF3B30]/10 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-12 bg-[#FF3B30]/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                  <div className="absolute inset-0 bg-[#FF3B30]/10 rounded-full"></div>
                  <div className="absolute inset-10 bg-[#FF3B30]/15 rounded-full"></div>
                  
                  {/* The Button */}
                  <div className="relative z-10 w-28 h-28 bg-[#FF3B30] rounded-full shadow-[0_0_40px_rgba(255,59,48,0.3)] flex items-center justify-center cursor-pointer hover:scale-95 transition-transform">
                    <span className="text-white font-bold text-lg tracking-widest">SOS</span>
                  </div>
                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-12 left-0 right-0 text-center text-[9px] tracking-[0.2em] uppercase text-zinc-600 font-mono">
                  Hold to activate
                </div>
                
                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-zinc-600 rounded-full"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative z-10 bg-[#0B0E16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-20">
            <div className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase mb-6">
              The Problem
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]" style={{ fontFamily: '"Outfit", system-ui, -apple-system, sans-serif' }}>
              Campus emergencies <br className="hidden md:block" />
              are slow to report, <br />
              <span className="text-[#3B82F6]">slower to respond.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800/30 rounded-3xl overflow-hidden border border-zinc-800/50">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-[#12151D] p-8 lg:p-10 hover:bg-[#161922] transition-colors h-full flex flex-col">
                <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm font-light">{feature.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B0E16] py-12 border-t border-white/5 relative z-10 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">
            © {new Date().getFullYear()} S.A.F.E. Campus Platform. Built for KWASU.
          </p>
        </div>
      </footer>
    </div>
  );
}
