import { useState, useEffect } from 'react';
import { Shield, Smartphone, Activity, Map, MessageSquare, Menu, X, ArrowRight, ShieldAlert } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-200 selection:text-red-900">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-red-700 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">S.A.F.E.</span>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-red-700 transition">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-red-700 transition">How it Works</a>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-sm font-semibold text-gray-900 hover:text-red-700 transition px-3 py-2"
                >
                  Web Portal
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="text-sm font-semibold bg-red-700 text-white px-5 py-2.5 rounded-full hover:bg-red-800 transition shadow-lg shadow-red-700/30"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Mobile Nav Toggle */}
            <button 
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-4 flex flex-col gap-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 font-medium">How it Works</a>
            <div className="h-px bg-gray-100 my-2" />
            <button 
              onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
              className="text-left font-semibold text-gray-900"
            >
              Web Portal Login
            </button>
            <button 
              onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
              className="bg-red-700 text-white text-center py-3 rounded-xl font-semibold mt-2"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-[600px] h-[600px] bg-red-100/60 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
          <div className="w-[500px] h-[500px] bg-orange-100/60 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 max-w-4xl mx-auto leading-tight">
            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">Campus Security</span> in Real-Time.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The Student Alert & Fast Emergency (S.A.F.E.) system connects you directly to campus security with intelligent AI routing, live location tracking, and offline mesh fallbacks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-red-700 text-white rounded-2xl font-bold text-lg hover:bg-red-800 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-red-700/30 flex items-center justify-center gap-2 group"
            >
              <Smartphone className="w-5 h-5" />
              Download Mobile App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
            >
              Access Web Portal
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Engineered for Emergencies</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Every second counts. S.A.F.E. is packed with cutting-edge tech to ensure your alerts reach responders immediately.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-gray-50 rounded-3xl p-8 hover:bg-red-50 transition-colors duration-300 border border-gray-100 hover:border-red-100 group">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
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
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-500" />
              <span className="font-extrabold text-xl text-white tracking-tight">S.A.F.E.</span>
            </div>
            <div className="flex gap-6">
              <button onClick={() => onNavigate('admin-login')} className="text-gray-400 hover:text-white transition text-sm">
                Admin Login
              </button>
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</a>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} S.A.F.E. Campus Security.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
