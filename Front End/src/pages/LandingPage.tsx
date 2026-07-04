import { useState, useEffect } from 'react';
import { Shield, Smartphone, Activity, Map, MessageSquare, Menu, X, ArrowRight, ShieldAlert, Cpu, WifiOff, CheckCircle2, Siren } from 'lucide-react';

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
      title: 'Instant SOS Alerts',
      description: 'Trigger a campus-wide alert with a single tap. Security personnel receive your exact location instantly.',
      icon: <ShieldAlert className="w-6 h-6 text-red-500" />
    },
    {
      title: 'AI Security Assistant',
      description: 'Interact with our intelligent chatbot to report suspicious activities or get emergency guidance 24/7.',
      icon: <MessageSquare className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Offline Mesh Fallback',
      description: 'No internet? No problem. Our app uses peer-to-peer Bluetooth mesh to bounce your alert until it reaches a connection.',
      icon: <Activity className="w-6 h-6 text-red-500" />
    },
    {
      title: 'Live Campus Map',
      description: 'View safe zones, ongoing incidents, and the fastest routes to security outposts in real-time.',
      icon: <Map className="w-6 h-6 text-red-500" />
    }
  ];

  const steps = [
    {
      title: '1. Trigger SOS',
      description: 'Tap the emergency button in the app or web portal. Your live location is captured instantly.',
      icon: <Siren className="w-8 h-8 text-white" />,
      color: 'from-red-500 to-red-600'
    },
    {
      title: '2. AI Classification',
      description: 'Our AI model analyzes incident context in milliseconds, assigning a severity score to prioritize critical threats.',
      icon: <Cpu className="w-8 h-8 text-white" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      title: '3. Mesh Delivery',
      description: 'If offline, the alert leaps between nearby devices using Bluetooth until it finds an internet connection to reach servers.',
      icon: <WifiOff className="w-8 h-8 text-white" />,
      color: 'from-red-600 to-rose-700'
    },
    {
      title: '4. Rapid Response',
      description: 'Campus security receives the high-priority alert and dispatches nearest personnel to your exact GPS coordinates.',
      icon: <CheckCircle2 className="w-8 h-8 text-white" />,
      color: 'from-rose-600 to-red-800'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-200 selection:text-red-900 overflow-x-hidden">
      
      {/* Toast Notification */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
          <Smartphone className="w-5 h-5 text-red-400" />
          <span className="font-medium text-sm">Mobile App coming to app stores soon!</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-2.5 rounded-xl shadow-lg shadow-red-700/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">S.A.F.E.</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-red-700 transition-colors">How it Works</a>
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-red-700 transition-colors">Features</a>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-sm font-bold text-slate-700 hover:text-red-700 transition-colors px-3 py-2"
                >
                  Web Portal
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="text-sm font-bold bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile Nav Toggle */}
            <button 
              className="md:hidden text-slate-600 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl py-6 px-6 flex flex-col gap-5 animate-slide-up-fade origin-top">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-bold text-lg">How it Works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-bold text-lg">Features</a>
            <div className="h-px bg-slate-100 my-2" />
            <button 
              onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
              className="text-left font-bold text-slate-800 text-lg"
            >
              Web Portal Login
            </button>
            <button 
              onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
              className="bg-red-700 text-white text-center py-4 rounded-2xl font-bold mt-2 shadow-lg shadow-red-700/20"
            >
              Create Account
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        {/* Animated Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-red-300/40 rounded-full blur-[100px] animate-blob mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] bg-orange-300/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-200/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-700 font-semibold text-sm mb-8 animate-slide-up-fade">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Protecting Campus 24/7
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1] animate-slide-up-fade" style={{animationDelay: '100ms'}}>
            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-600 drop-shadow-sm">Campus Security</span> in Real-Time.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up-fade font-medium" style={{animationDelay: '200ms'}}>
            The Student Alert & Fast Emergency (S.A.F.E.) system connects you directly to campus security with intelligent AI routing, live location tracking, and offline mesh fallbacks.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-slide-up-fade" style={{animationDelay: '300ms'}}>
            <button 
              onClick={handleDownloadClick}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-2xl font-bold text-lg hover:from-red-800 hover:to-red-700 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-red-700/30 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <Smartphone className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Download App</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              Access Web Portal
            </button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900 relative overflow-hidden text-white scroll-mt-20">
        {/* Dark theme blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-800/60 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">How S.A.F.E. Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Our system is designed to bypass traditional bottlenecks, ensuring your cry for help reaches responders instantly, even in the worst conditions.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-slate-800 via-red-900 to-slate-800" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {steps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center group">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} p-0.5 shadow-2xl shadow-red-900/20 mb-8 transform group-hover:-translate-y-2 transition-transform duration-300`}>
                    <div className="w-full h-full bg-slate-900/90 rounded-[22px] flex items-center justify-center backdrop-blur-xl">
                      <div className="animate-float" style={{animationDelay: `${idx * 0.5}s`}}>
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white relative scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Engineered for Emergencies</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-xl leading-relaxed">
              Every second counts. S.A.F.E. is packed with cutting-edge tech to ensure your alerts reach responders immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-slate-50/50 backdrop-blur-sm rounded-[32px] p-8 hover:bg-white transition-all duration-500 border border-slate-100 hover:border-red-100 hover:shadow-2xl hover:shadow-red-900/5 group">
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-red-50 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="bg-red-900/50 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">S.A.F.E.</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <button onClick={() => onNavigate('admin-login')} className="text-slate-400 hover:text-white font-medium transition-colors">
                Admin Portal
              </button>
              <button onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="text-slate-400 hover:text-white font-medium transition-colors">
                Privacy Policy
              </button>
              <button onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="text-slate-400 hover:text-white font-medium transition-colors">
                Terms of Service
              </button>
            </div>
            
            <p className="text-slate-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} S.A.F.E. Campus Security.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
