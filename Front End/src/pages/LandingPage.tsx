import { Shield, ArrowRight, Activity, MapPin, Zap, Radio, BrainCircuit, Users, Lock, Smartphone, Crosshair, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {

  // Smooth scroll
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#cc0000] selection:text-white flex flex-col overflow-x-hidden relative">
      
      {/* Navbar - Floating Capsule */}
      <div className="w-full flex justify-center pt-6 px-4 md:px-6 fixed z-50 top-0">
        <nav className="w-full max-w-7xl bg-[#111] border border-gray-800 rounded-full py-4 px-6 md:px-8 flex justify-between items-center shadow-2xl backdrop-blur-md bg-opacity-90">
          
          {/* Restored Original Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#cc0000] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 border border-red-700">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="block font-black text-sm tracking-widest text-white uppercase">S.A.F.E.</span>
              <span className="block font-bold text-[10px] tracking-tight text-gray-400 uppercase">Kwara State Univ</span>
            </div>
          </div>
          
          {/* Links (Hidden on mobile) */}
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#workflow" className="hover:text-white transition-colors">How it Works</a>
            <a href="#technology" className="hover:text-white transition-colors">Core Tech</a>
          </div>

          {/* Actions */}
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => onNavigate('login')}
              className="text-xs font-bold text-gray-300 hover:text-white transition-colors hidden sm:block uppercase tracking-wider"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="text-xs font-bold bg-[#cc0000] text-white px-6 py-2.5 rounded-full hover:bg-[#a30000] transition-colors uppercase tracking-wider shadow-lg shadow-red-900/20 border border-red-700"
            >
              Get Protected
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="w-full pt-40 md:pt-52 flex flex-col relative z-10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto w-full px-6 flex flex-col items-start mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-950/30 border border-red-900/50 text-red-500 rounded-full text-[10px] font-bold tracking-widest uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Grid Active & Live
          </div>
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-gray-300 mb-6 max-w-2xl leading-tight">
            When seconds count, <br/>
            <span className="font-black text-white">Traditional calls fail.</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
            Smart Alert & Field Emergency (S.A.F.E.) bypasses the cellular bottleneck, utilizing AI triage and offline mesh networking to guarantee your SOS is heard.
          </p>
          <button 
            onClick={() => onNavigate('register')}
            className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            Join the Grid <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Massive Scalable Typography */}
        <div className="w-full overflow-hidden flex flex-col relative pb-20 border-b border-gray-900">
          <h1 className="text-[25vw] leading-[0.75] font-black text-white whitespace-nowrap tracking-tighter -ml-[1vw] select-none opacity-95">
            S.A.F.E.
          </h1>
          <div className="pl-[20vw] flex items-center mt-4">
             <span className="text-[6vw] leading-[0.9] font-bold text-red-600 tracking-tighter select-none">
               SECURITY NETWORK
             </span>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="w-full py-24 px-6 md:px-12 bg-[#111]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row gap-12 justify-between">
            <div className="md:w-1/3">
              <h3 className="text-3xl font-black uppercase tracking-tight mb-4">The Bottleneck.</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                In high-stress environments, calling a security dispatch line introduces fatal delays. Network congestion, human miscommunication, and inaccurate location data cost precious time. S.A.F.E. removes the human barrier from the initial alert phase.
              </p>
            </div>
            
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800">
                <Users className="w-6 h-6 text-[#cc0000] mb-4" />
                <h4 className="font-bold text-lg mb-2">Dispatcher Overload</h4>
                <p className="text-sm text-gray-500">During campus-wide incidents, traditional hotlines get busy. S.A.F.E. routes digital alerts directly to active field units.</p>
              </div>
              <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800">
                <Crosshair className="w-6 h-6 text-[#cc0000] mb-4" />
                <h4 className="font-bold text-lg mb-2">Vague Locations</h4>
                <p className="text-sm text-gray-500">"I'm near the science block" isn't enough. Our system pulls live, exact GPS coordinates immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Workflow / Software Action Sequence */}
      <section id="workflow" className="w-full py-32 px-6 md:px-12 bg-[#0a0a0a] relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-[10px] font-bold text-[#cc0000] tracking-[0.3em] uppercase mb-4">The Workflow</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Anatomy of an Alert.
            </h3>
            <p className="text-gray-400 mt-6 text-lg">
              S.A.F.E. does not just send a text message. It executes a complex, multi-tiered response protocol in under 1.5 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-[1px] bg-gray-800 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col gap-4 relative">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full border border-gray-700 flex items-center justify-center mb-2 z-10 mx-auto md:mx-0">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <span className="text-[#cc0000] font-black text-sm uppercase tracking-widest">01. Trigger</span>
                <h4 className="font-bold text-xl mt-2 mb-3">Instant Activation</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  A single tap in the app, or a press of a paired hardware button, instantly generates an encrypted payload containing your identity and live GPS coordinates.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-4 relative md:mt-12">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full border border-gray-700 flex items-center justify-center mb-2 z-10 mx-auto md:mx-0">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <span className="text-[#cc0000] font-black text-sm uppercase tracking-widest">02. Triage</span>
                <h4 className="font-bold text-xl mt-2 mb-3">AI Context Analysis</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The payload hits the backend. AI algorithms analyze historical incident data, user profiles, and keyword severity (if chat is used) to assign priority levels automatically.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-4 relative">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full border border-gray-700 flex items-center justify-center mb-2 z-10 mx-auto md:mx-0">
                <Radio className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <span className="text-[#cc0000] font-black text-sm uppercase tracking-widest">03. Routing</span>
                <h4 className="font-bold text-xl mt-2 mb-3">Smart / Mesh Routing</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  If the grid is online, it routes via WebSockets. If offline, the app switches to Peer-to-Peer Mesh Networking, bouncing the SOS across other student phones until it finds an internet connection.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-4 relative md:mt-12">
              <div className="w-20 h-20 bg-[#cc0000] rounded-full border border-red-700 shadow-lg shadow-red-900/40 flex items-center justify-center mb-2 z-10 mx-auto md:mx-0">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <span className="text-[#cc0000] font-black text-sm uppercase tracking-widest">04. Dispatch</span>
                <h4 className="font-bold text-xl mt-2 mb-3">Live Tracking</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Security personnel receive the alert on their map interface. The system establishes a real-time, bidirectional socket connection, tracking your movement live as they close in.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Tech Highlights */}
      <section id="technology" className="w-full py-24 px-6 md:px-12 bg-[#111] border-y border-gray-900">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Architected for Resilience.</h2>
            
            <div className="flex flex-col gap-8">
              <div className="flex gap-4">
                <div className="mt-1">
                  <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-gray-800">
                    <Zap className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Socket.io Telemetry</h4>
                  <p className="text-sm text-gray-500">Persistent WebSocket connections ensure that location data is pushed instantly, rather than waiting for client-side polling intervals.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="mt-1">
                  <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-gray-800">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Encrypted Payloads</h4>
                  <p className="text-sm text-gray-500">All geographical and personal data transmitted across the mesh network or HTTPS is strictly encrypted, ensuring student privacy.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-[400px] flex items-center justify-center">
             {/* Abstract Map Interface Mockup */}
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             <div className="relative w-64 h-64 border border-red-900/30 rounded-full flex items-center justify-center">
               <div className="absolute w-full h-full border border-red-900/50 rounded-full animate-ping opacity-20"></div>
               <div className="w-32 h-32 border border-[#cc0000] rounded-full flex items-center justify-center bg-red-900/10">
                 <MapPin className="w-8 h-8 text-[#cc0000]" />
               </div>
               
               {/* Dummy tracking dots */}
               <div className="absolute top-10 right-10 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
               <div className="absolute bottom-20 left-12 w-2 h-2 bg-gray-500 rounded-full"></div>
             </div>
          </div>
        </div>
      </section>

      {/* A Unified Ecosystem / Footer */}
      <section className="w-full pt-32 pb-12 px-6 md:px-12 bg-[#0a0a0a] text-center flex flex-col items-center">
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 max-w-4xl">
          Join the Grid.
        </h2>
        <p className="text-gray-400 text-lg mb-12 max-w-xl">
          Security is not a solo effort. It is a network. Empower yourself and protect your peers by becoming a node in the S.A.F.E. ecosystem.
        </p>
        
        <button 
          onClick={() => onNavigate('register')}
          className="group bg-[#cc0000] text-white px-10 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#a30000] transition-colors flex items-center gap-3 shadow-lg shadow-red-900/30 border border-red-700 mb-32"
        >
          Get Protected Now
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        {/* Footer Base */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center border-t border-gray-900 pt-8 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <Shield className="w-3 h-3 text-gray-400" />
            </div>
            <span className="font-bold text-xs tracking-widest text-gray-400 uppercase">S.A.F.E. Engine v1.0</span>
          </div>
          
          <div className="flex gap-6">
            <button 
              onClick={() => onNavigate('admin-login')}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
            >
              Admin Console
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-800">
              © {new Date().getFullYear()} KWASU S.A.F.E.
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
