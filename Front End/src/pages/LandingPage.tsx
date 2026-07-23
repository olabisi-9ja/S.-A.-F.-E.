import { useState, useEffect } from 'react';
import { Shield, Smartphone, Activity, Map, MessageSquare, Menu, X, ArrowRight, ShieldAlert, Cpu, WifiOff, CheckCircle2, Siren, Crosshair } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const features = [
    {
      id: 'F-01',
      title: 'ONE-TAP SOS',
      description: 'Trigger a geolocated emergency alert in under 3 seconds with no forms or menus.',
      icon: <ShieldAlert className="w-6 h-6 text-red-500" />
    },
    {
      id: 'F-02',
      title: 'AI TRIAGE',
      description: 'A fine-tuned NLP microservice classifies each report by type and urgency to route it to the right team instantly.',
      icon: <Cpu className="w-6 h-6 text-red-500" />
    },
    {
      id: 'F-03',
      title: 'OFFLINE MESH',
      description: 'Low signal? SOS relays peer-to-peer over BLE until it reaches a device with connectivity.',
      icon: <WifiOff className="w-6 h-6 text-red-500" />
    },
    {
      id: 'F-04',
      title: 'LIVE DISPATCH',
      description: 'Security officers get a live Mapbox dashboard with incident queue management and officer assignments.',
      icon: <Map className="w-6 h-6 text-red-500" />
    },
    {
      id: 'F-05',
      title: 'ANONYMOUS MODE',
      description: 'Whistle-blower style reports stripped of all metadata before storage. Untraceable by design.',
      icon: <MessageSquare className="w-6 h-6 text-red-500" />
    },
    {
      id: 'F-06',
      title: 'PUSH NOTIFICATIONS',
      description: 'Real-time status updates from the moment a report is submitted through to resolution.',
      icon: <Activity className="w-6 h-6 text-red-500" />
    }
  ];

  const steps = [
    {
      id: 'S-01',
      title: 'TRIGGER SOS',
      description: 'Tap the emergency button in the app or web portal. Your live location is captured instantly.',
      icon: <Siren className="w-6 h-6 text-red-500" />
    },
    {
      id: 'S-02',
      title: 'AI CLASSIFICATION',
      description: 'Our AI model analyzes incident context in milliseconds, assigning a severity score to prioritize critical threats.',
      icon: <Cpu className="w-6 h-6 text-red-500" />
    },
    {
      id: 'S-03',
      title: 'MESH DELIVERY',
      description: 'If offline, the alert leaps between nearby devices using Bluetooth until it finds an internet connection to reach servers.',
      icon: <WifiOff className="w-6 h-6 text-red-500" />
    },
    {
      id: 'S-04',
      title: 'RAPID RESPONSE',
      description: 'Campus security receives the high-priority alert and dispatches nearest personnel to your exact GPS coordinates.',
      icon: <CheckCircle2 className="w-6 h-6 text-red-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-red-900 selection:text-white overflow-x-hidden relative">
      
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Toast Notification */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-black text-white px-6 py-4 border border-red-900 flex items-center gap-4 uppercase font-mono text-xs tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.3)]">
          <Smartphone className="w-4 h-4 text-red-500 animate-pulse" />
          <span>Mobile App deployment pending.</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              <div className="relative flex items-center justify-center w-10 h-10 border border-red-900 bg-black group-hover:border-red-500 transition-colors">
                <Shield className="w-5 h-5 text-red-600" />
                <div className="absolute inset-0 border border-red-500 animate-ping opacity-20"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-bold text-lg tracking-widest text-white leading-none">S.A.F.E.</span>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="font-mono text-xs tracking-widest text-zinc-400 hover:text-red-500 transition-colors uppercase">Workflow</a>
              <a href="#features" className="font-mono text-xs tracking-widest text-zinc-400 hover:text-red-500 transition-colors uppercase">Specs</a>
              <div className="flex items-center gap-4 pl-6 border-l border-zinc-800">
                <button 
                  onClick={() => onNavigate('login')}
                  className="font-mono text-xs tracking-widest text-zinc-300 hover:text-white transition-colors uppercase"
                >
                  [ Login ]
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="relative group bg-red-600 text-white font-mono text-xs tracking-widest uppercase px-6 py-3 overflow-hidden border border-red-500 hover:bg-red-700 transition-colors"
                >
                  <span className="relative z-10">Sign Up</span>
                  <div className="absolute inset-0 bg-red-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            </div>

            {/* Mobile Nav Toggle */}
            <button 
              className="md:hidden text-zinc-400 p-2 border border-zinc-800 hover:text-white hover:border-zinc-600 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 py-6 px-6 flex flex-col gap-6">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="font-mono text-sm tracking-widest text-zinc-300 uppercase">Workflow</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-mono text-sm tracking-widest text-zinc-300 uppercase">Specs</a>
            <div className="h-px bg-zinc-800 my-2" />
            <button 
              onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
              className="text-left font-mono text-sm tracking-widest text-zinc-300 uppercase"
            >
              Login
            </button>
            <button 
              onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
              className="bg-red-600 text-white text-center py-4 font-mono text-sm tracking-widest uppercase border border-red-500"
            >
              Sign Up
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 flex items-center min-h-[90vh] z-10">
        
        {/* Technical Radar Graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20">
          <div className="absolute inset-0 rounded-full border border-red-500/30"></div>
          <div className="absolute inset-8 rounded-full border border-red-500/20"></div>
          <div className="absolute inset-16 rounded-full border border-red-500/10"></div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500/20"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/20"></div>
          <div className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite] border-t-2 border-red-500 rounded-full opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center md:items-start text-center md:text-left">
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-3xl leading-[1.1] uppercase">
            Empowering <br />
            <span className="text-red-600 flex items-center gap-4 justify-center md:justify-start mt-2">
              <Crosshair className="w-10 h-10 md:w-14 md:h-14 animate-pulse" />
              Campus Security
            </span>
          </h1>
          
          <p className="text-lg text-zinc-400 mb-12 max-w-2xl leading-relaxed font-light border-l-2 border-zinc-800 pl-6 text-left">
            The Smart Alert and Field Emergency (S.A.F.E.) system connects you directly to campus security with intelligent AI routing, live location tracking, and offline mesh fallbacks. Built for speed. Engineered for reliability.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <button 
              onClick={handleDownloadClick}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white font-mono text-sm font-bold tracking-widest uppercase hover:bg-red-700 transition-colors border border-red-500 flex items-center justify-center gap-3 group relative shadow-[4px_4px_0_0_rgba(220,38,38,0.3)] hover:shadow-[2px_2px_0_0_rgba(220,38,38,0.5)] hover:translate-y-[2px] hover:translate-x-[2px]"
            >
              <Smartphone className="w-5 h-5" />
              <span>Deploy App</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-white border border-zinc-700 font-mono text-sm tracking-widest uppercase hover:border-white transition-colors hover:bg-zinc-900"
            >
              Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 relative z-10 border-t border-zinc-900 bg-zinc-950/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="font-mono text-red-600 text-sm tracking-widest uppercase mb-4">Workflow</div>
              <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">System Workflow</h2>
            </div>
            <p className="text-zinc-500 max-w-md text-sm border-l border-zinc-800 pl-4 font-mono leading-relaxed">
              Bypassing traditional bottlenecks to ensure high-priority signals reach responders instantly, regardless of network conditions.
            </p>
          </div>

          <div className="relative">
            {/* Pipeline connecting line */}
            <div className="absolute top-0 bottom-0 left-[27px] md:left-auto md:top-[27px] md:bottom-auto md:w-full w-px md:h-px bg-zinc-800 z-0"></div>
            
            <div className="grid md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col group pl-16 md:pl-0">
                  <div className="absolute left-0 top-0 md:relative md:mb-8 w-14 h-14 bg-black border border-zinc-800 flex items-center justify-center group-hover:border-red-500 transition-colors z-10 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                    {step.icon}
                  </div>
                  <div className="font-mono text-xs text-zinc-600 tracking-widest mb-2">{step.id}</div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-3">{step.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative z-10 border-t border-zinc-900 scroll-mt-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="font-mono text-red-600 text-sm tracking-widest uppercase mb-4">Specifications</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">Engineered for Extremes</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-8 hover:border-red-600 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 font-mono text-[10px] text-zinc-800 group-hover:text-red-900/50 transition-colors">{feature.id}</div>
                <div className="w-12 h-12 bg-black border border-zinc-800 flex items-center justify-center mb-8 group-hover:border-red-500 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-4 group-hover:text-red-500 transition-colors">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feature.description}</p>
                {/* Decorative corner accent */}
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-red-600 opacity-0 group-hover:opacity-100 transition-opacity m-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Showcase Section */}
      <section className="py-32 relative z-10 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <div className="text-red-500 font-mono text-[10px] tracking-widest uppercase mb-8 flex items-center gap-4">
                <span className="font-bold">01</span>
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                <span>Mobile Terminal</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8 leading-[1.1] uppercase">
                Emergency response in your pocket.
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg font-light border-l border-zinc-800 pl-4 font-mono text-sm">
                The student-facing app is built for speed. The SOS button is always one tap away, and it requires no authentication during an emergency.
              </p>
              
              <div className="flex flex-wrap gap-4">
                {['React Native', 'Expo', 'BLE Mesh', 'Expo Location'].map(tech => (
                  <div key={tech} className="px-5 py-2 border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-500 uppercase tracking-widest hover:border-red-900 transition-colors">
                    {tech}
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup CSS */}
            <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
              {/* Glow Behind Phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[80px]"></div>
              
              <div className="relative w-[280px] h-[580px] bg-black rounded-[45px] border-[8px] border-zinc-900 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-6 mx-auto lg:mr-8 group">
                {/* Phone Notch/Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-950 rounded-full z-20"></div>
                
                {/* Phone Status Bar */}
                <div className="absolute top-5 left-6 text-[10px] text-zinc-500 font-medium z-20">9:41</div>
                <div className="absolute top-5 right-6 flex items-center gap-1 z-20">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
                </div>

                {/* Background gradient for the phone */}
                <div className="absolute inset-0 bg-zinc-950" 
                     style={{ 
                       backgroundImage: `linear-gradient(rgba(255,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,0,0.03) 1px, transparent 1px)`,
                       backgroundSize: '20px 20px' 
                     }}></div>

                {/* SOS Button Area */}
                <div className="relative w-full aspect-square flex items-center justify-center mt-12">
                  {/* Expanding Rings */}
                  <div className="absolute inset-[-10px] bg-red-500/5 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 bg-red-500/10 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-12 bg-red-500/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                  <div className="absolute inset-0 bg-red-500/10 rounded-full border border-red-900/30"></div>
                  <div className="absolute inset-10 bg-red-500/15 rounded-full border border-red-500/20"></div>
                  
                  {/* The Button */}
                  <div className="relative z-10 w-28 h-28 bg-red-600 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.3)] flex items-center justify-center cursor-pointer hover:scale-95 transition-transform group-hover:shadow-[0_0_60px_rgba(220,38,38,0.5)]">
                    <span className="text-white font-mono font-bold text-xl tracking-widest">SOS</span>
                  </div>
                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-12 left-0 right-0 text-center text-[9px] tracking-[0.2em] uppercase text-red-500/50 font-mono">
                  Hold to activate
                </div>
                
                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-zinc-800 rounded-full"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-zinc-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-600" />
              <span className="font-mono font-bold text-lg text-white tracking-widest uppercase">S.A.F.E. Core</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <button onClick={() => onNavigate('admin-login')} className="font-mono text-xs tracking-widest text-zinc-600 hover:text-red-500 transition-colors uppercase">
                Admin Console
              </button>
              <button onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="font-mono text-xs tracking-widest text-zinc-600 hover:text-red-500 transition-colors uppercase">
                Data Policy
              </button>
              <button onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="font-mono text-xs tracking-widest text-zinc-600 hover:text-red-500 transition-colors uppercase">
                Terms of Protocol
              </button>
            </div>
            
            <div className="font-mono text-[10px] text-zinc-700 tracking-widest uppercase">
              SYS_REV: {new Date().getFullYear()} // KWASU
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
