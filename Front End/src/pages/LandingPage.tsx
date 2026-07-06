import { useState, useEffect } from 'react';
import { Shield, Smartphone, Activity, Map, MessageSquare, Menu, X, ArrowRight, ShieldAlert, Cpu, WifiOff, CheckCircle2, Crosshair } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      id: '01',
      title: 'Instant SOS Alerts',
      description: 'Trigger a campus-wide alert with a single tap. Security personnel receive your exact location instantly.',
      icon: <ShieldAlert className="w-6 h-6 text-red-600" />
    },
    {
      id: '02',
      title: 'Live Location Tracking',
      description: 'Share your live GPS coordinates with security personnel during an active emergency, complete with driving directions.',
      icon: <Crosshair className="w-6 h-6 text-red-600" />
    },
    {
      id: '03',
      title: 'Offline Mesh Fallback',
      description: 'No internet? No problem. Our app uses peer-to-peer Bluetooth mesh to bounce your alert until it reaches a connection.',
      icon: <WifiOff className="w-6 h-6 text-red-600" />
    },
    {
      id: '04',
      title: 'Live Campus Map',
      description: 'View safe zones, ongoing incidents, and the fastest routes to security outposts in real-time.',
      icon: <Map className="w-6 h-6 text-red-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-200 selection:text-red-900 overflow-x-hidden relative">
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
             backgroundSize: '40px 40px' 
           }}>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 group-hover:bg-red-200 transition-colors">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900 leading-none tracking-tight">S.A.F.E.</span>
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-1">KWASU Security</span>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">How it Works</a>
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">Features</a>
              <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
                >
                  Log In
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="bg-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-red-700 transition-colors hover:shadow-md active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Mobile Nav Toggle */}
            <button 
              className="md:hidden text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 py-4 px-4 flex flex-col gap-2 shadow-lg">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-700 p-3 rounded-lg hover:bg-gray-50">How it Works</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-gray-700 p-3 rounded-lg hover:bg-gray-50">Features</a>
            <div className="h-px bg-gray-100 my-2" />
            <button 
              onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
              className="text-left text-base font-medium text-gray-700 p-3 rounded-lg hover:bg-gray-50"
            >
              Log In
            </button>
            <button 
              onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
              className="bg-red-600 text-white text-center py-3 rounded-lg font-semibold mt-2 active:scale-95 transition-transform"
            >
              Create Account
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex items-center min-h-screen z-10 overflow-hidden">
        
        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] pointer-events-none opacity-40 blur-[100px] -z-10">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-red-600 text-xs font-bold uppercase tracking-wide mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full bg-red-500 opacity-75 rounded-full"></span>
              <span className="relative inline-flex h-2 w-2 bg-red-600 rounded-full"></span>
            </span>
            System Status: Active
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 max-w-4xl leading-tight">
            Empowering <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
              Campus Security
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed font-medium">
            The Student Alert & Fast Emergency (S.A.F.E.) system connects you directly to campus security with intelligent routing, live tracking, and offline mesh fallbacks.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:bg-red-700 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                alert("Mobile app coming soon! Use the web terminal for now.");
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Smartphone className="w-5 h-5 text-gray-600" />
              Download App
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative z-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Engineered for Safety</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Modern tools ensuring you are never out of reach when it matters most.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-lg hover:border-red-100 transition-all group">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 text-red-600 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">S.A.F.E.</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={() => onNavigate('admin-login')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Admin Login
              </button>
              <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
            
            <div className="text-sm text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} KWASU Security
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
