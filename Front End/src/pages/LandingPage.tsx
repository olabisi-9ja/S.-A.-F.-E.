import { Shield, ArrowRight, Activity, MapPin, Zap } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-red-600 selection:text-white overflow-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center transform rotate-3">
            <Shield className="w-4 h-4 text-white -rotate-3" strokeWidth={3} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">S.A.F.E.</span>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => onNavigate('login')}
            className="text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="text-sm font-bold uppercase tracking-wider bg-gray-900 text-white px-5 py-2 hover:bg-red-600 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-6 md:px-12 relative">
        
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[50vw] h-[100vh] bg-red-50 -z-10 translate-x-1/4 skew-x-[-10deg]"></div>

        <div className="max-w-4xl pt-12 pb-24">
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter text-gray-900 mb-8">
            Campus <br/>
            Safety, <br/>
            <span className="text-red-600 inline-flex items-center gap-4">
              Reimagined.
              <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse mt-4 hidden md:block"></div>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-xl leading-snug mb-12 border-l-4 border-red-600 pl-6">
            The Student Alert & Fast Emergency network. Instant SOS routing, offline mesh connectivity, and live GPS tracking when every second counts.
          </p>
          
          <button 
            onClick={() => onNavigate('register')}
            className="group inline-flex items-center gap-4 bg-red-600 text-white px-8 py-5 text-lg font-black uppercase tracking-wider hover:bg-gray-900 transition-all duration-300"
          >
            Trigger Initialization
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Feature Grid - Asymmetrical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-px bg-gray-100 max-w-5xl mt-auto mb-12 border border-gray-100">
          
          <div className="bg-white p-8 group hover:bg-red-600 transition-colors duration-300 cursor-default">
            <Zap className="w-8 h-8 text-red-600 mb-6 group-hover:text-white transition-colors" strokeWidth={2.5} />
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-white">Instant SOS</h3>
            <p className="text-gray-500 font-medium leading-relaxed group-hover:text-red-100">
              One-tap emergency broadcast directly to campus security with automated severity classification.
            </p>
          </div>

          <div className="bg-white p-8 group hover:bg-gray-900 transition-colors duration-300 cursor-default">
            <Activity className="w-8 h-8 text-red-600 mb-6 group-hover:text-red-500 transition-colors" strokeWidth={2.5} />
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-white">Mesh Network</h3>
            <p className="text-gray-500 font-medium leading-relaxed group-hover:text-gray-400">
              Zero internet? Device-to-device Bluetooth routing ensures your alert still finds its way out.
            </p>
          </div>

          <div className="bg-white p-8 group hover:bg-red-50 transition-colors duration-300 cursor-default">
            <MapPin className="w-8 h-8 text-red-600 mb-6" strokeWidth={2.5} />
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Live Tracking</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Real-time GPS bridging between students and responders with automated routing protocols.
            </p>
          </div>

        </div>
      </main>

      <footer className="w-full py-6 px-6 md:px-12 flex justify-between items-center border-t border-gray-100 bg-white">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Kwara State University
        </span>
        <button 
          onClick={() => onNavigate('admin-login')}
          className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-gray-900 transition-colors"
        >
          Admin Console
        </button>
      </footer>

    </div>
  );
}
