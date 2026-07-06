import { Shield, ArrowRight, Activity, MapPin, Zap, Radio, BrainCircuit, Users, Lock, Smartphone } from 'lucide-react';
import { useEffect } from 'react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  
  // Basic smooth scroll effect
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; }
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-red-600 selection:text-white flex flex-col">
      
      {/* Navbar */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center z-50 sticky top-0 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-sm flex items-center justify-center transform rotate-3">
            <Shield className="w-4 h-4 text-white -rotate-3" strokeWidth={3} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">S.A.F.E. KWASU</span>
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
            className="text-sm font-bold uppercase tracking-wider bg-gray-900 text-white px-5 py-2 hover:bg-red-600 transition-colors shadow-lg"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-32 px-6 md:px-12 overflow-hidden flex flex-col items-center text-center">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-1/2 w-[100vw] h-[100vh] bg-red-50 -z-10 translate-x-1/2 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-4xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Live Security Network
          </div>

          <h1 className="text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter text-gray-900 mb-8">
            Smart Alert & <br/>
            Fast <span className="text-red-600">Emergency</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
            The next-generation campus security grid for Kwara State University. 
            Guaranteeing your safety with instant SOS routing, AI-powered triage, 
            and offline mesh connectivity.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate('register')}
              className="group flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-5 text-lg font-black uppercase tracking-wider hover:bg-gray-900 transition-all duration-300 w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Get Protected Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView()}
              className="flex items-center justify-center px-8 py-5 text-lg font-black uppercase tracking-wider text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all duration-300 w-full sm:w-auto"
            >
              Learn How It Works
            </button>
            <button 
              disabled
              className="flex items-center justify-center gap-2 px-8 py-5 text-lg font-black uppercase tracking-wider text-gray-400 bg-white border-2 border-gray-200 cursor-not-allowed transition-all duration-300 w-full sm:w-auto"
            >
              <Smartphone className="w-5 h-5" />
              App Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Section */}
      <section className="w-full py-24 px-6 md:px-12 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6">
              Why Traditional <br/><span className="text-red-500">Calls Fail.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              During a severe emergency, panic makes it difficult to clearly describe your location over a phone call. Furthermore, network congestion or dead zones on campus can completely sever your connection to help.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              S.A.F.E. eliminates the human error of panic. By relying on silent, instant data transmission, your exact GPS coordinates are sent directly to the security dashboard without you having to speak a single word.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-6 border-l-4 border-red-500">
              <Zap className="w-8 h-8 text-red-500 mb-4" />
              <h4 className="font-bold text-xl mb-2">Instant Response</h4>
              <p className="text-sm text-gray-400">Security gets your alert in milliseconds, skipping the phone queue.</p>
            </div>
            <div className="bg-gray-800 p-6 border-l-4 border-red-500">
              <MapPin className="w-8 h-8 text-red-500 mb-4" />
              <h4 className="font-bold text-xl mb-2">Pinpoint Accuracy</h4>
              <p className="text-sm text-gray-400">GPS bridging plots your exact location on the admin map immediately.</p>
            </div>
            <div className="bg-gray-800 p-6 border-l-4 border-red-500">
              <Radio className="w-8 h-8 text-red-500 mb-4" />
              <h4 className="font-bold text-xl mb-2">Zero Network?</h4>
              <p className="text-sm text-gray-400">Our offline mesh protocol bypasses internet outages.</p>
            </div>
            <div className="bg-gray-800 p-6 border-l-4 border-red-500">
              <Lock className="w-8 h-8 text-red-500 mb-4" />
              <h4 className="font-bold text-xl mb-2">Encrypted</h4>
              <p className="text-sm text-gray-400">Your location data is private and only visible to authorized security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Core Technologies */}
      <section id="how-it-works" className="w-full py-32 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-gray-900 mb-4">
              Built For <span className="text-red-600">Survival.</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              S.A.F.E. uses state-of-the-art technologies to ensure that no matter the situation, your distress signal is heard loud and clear.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Tech 1 */}
            <div className="bg-gray-50 p-10 group hover:bg-red-600 transition-colors duration-500">
              <div className="w-16 h-16 bg-white flex items-center justify-center rounded-xl mb-8 group-hover:bg-red-500 transition-colors">
                <BrainCircuit className="w-8 h-8 text-red-600 group-hover:text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-white">AI Severity Triage</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-red-100">
                When multiple incidents occur simultaneously, security needs to know what to prioritize. Our integrated NLP Artificial Intelligence scans incident descriptions in real-time, categorizing them into low, medium, or critical severity automatically.
              </p>
            </div>

            {/* Tech 2 */}
            <div className="bg-gray-50 p-10 group hover:bg-gray-900 transition-colors duration-500">
              <div className="w-16 h-16 bg-white flex items-center justify-center rounded-xl mb-8 group-hover:bg-gray-800 transition-colors">
                <Activity className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 group-hover:text-white">Offline Mesh Network</h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-400">
                What happens when the campus Wi-Fi drops and you run out of data? S.A.F.E. switches to Bluetooth mesh mode. Your phone will silently pass encrypted SOS packets to nearby student devices until one of them finds an internet connection to upload the alert.
              </p>
            </div>

            {/* Tech 3 */}
            <div className="bg-gray-50 p-10 group hover:bg-red-50 transition-colors duration-500">
              <div className="w-16 h-16 bg-white flex items-center justify-center rounded-xl mb-8 group-hover:bg-white transition-colors">
                <Smartphone className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-gray-900">Live GPS Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                A static location isn't enough if you're on the move. Once an emergency is triggered, S.A.F.E. creates a secure, real-time GPS bridge between your device and the security dispatch map, allowing responders to track your exact movements dynamically.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="w-full py-24 px-6 md:px-12 bg-red-600 text-white border-y-8 border-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
              A Unified Ecosystem.
            </h2>
            <p className="text-red-100 text-lg font-medium leading-relaxed mb-8">
              Safety is a collective effort. S.A.F.E. brings students, staff, and campus administration into one seamless security umbrella.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-900 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">For Students: One-tap protection anywhere on campus.</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-900 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">For Security: A live, interactive dashboard of all campus activity.</span>
              </li>
            </ul>
          </div>
          
          <div className="md:w-5/12 bg-white text-gray-900 p-10 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gray-900 -translate-y-4 translate-x-4 flex items-center justify-center transform rotate-12">
              <Shield className="w-8 h-8 text-white -rotate-12" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tight mb-4">Join The Grid</h3>
            <p className="text-gray-500 mb-8 font-medium">Create your verified student or staff account using your KWASU institutional ID.</p>
            <button 
              onClick={() => onNavigate('register')}
              className="w-full bg-red-600 text-white px-6 py-4 text-lg font-black uppercase tracking-wider hover:bg-gray-900 transition-colors"
            >
              Sign Up Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center bg-gray-50 border-t border-gray-200 mt-auto gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-600 rounded-sm flex items-center justify-center transform rotate-3 opacity-50">
            <Shield className="w-3 h-3 text-white -rotate-3" strokeWidth={3} />
          </div>
          <span className="font-black text-lg tracking-tighter uppercase text-gray-400">S.A.F.E.</span>
        </div>
        
        <span className="text-sm font-bold uppercase tracking-widest text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Kwara State University Security Directorate
        </span>
        
        <button 
          onClick={() => onNavigate('admin-login')}
          className="text-sm font-bold uppercase tracking-widest text-red-600 hover:text-gray-900 transition-colors"
        >
          Admin Console
        </button>
      </footer>

    </div>
  );
}
