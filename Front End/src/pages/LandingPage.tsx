import { Shield, ArrowRight, Activity, MapPin, Zap, Radio, BrainCircuit, Users, Lock, Smartphone } from 'lucide-react';
import { useEffect } from 'react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  
  // Basic smooth scroll effect
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; }
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#cc0000] selection:text-white flex flex-col">
      
      {/* Navbar */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          {/* Logo representation matching image */}
          <div className="flex items-center">
            <span className="text-[#cc0000] font-black text-2xl italic tracking-tighter">S</span>
            <div className="leading-none ml-1">
              <span className="block font-black text-xs tracking-tighter text-[#cc0000]">S.A.F.E.</span>
              <span className="block font-black text-sm tracking-tight text-[#1a2332]">KWASU</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => onNavigate('login')}
            className="text-xs font-bold uppercase tracking-wider text-[#1a2332] hover:text-[#cc0000] transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="text-xs font-bold uppercase tracking-wider bg-[#1a2332] text-white px-6 py-2 rounded hover:bg-[#0f1520] transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full pt-16 pb-24 px-6 md:px-12 flex flex-col items-center text-center bg-white">
        <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#e31818] text-white rounded-full text-xs font-bold tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            LIVE SECURITY NETWORK
          </div>

          <h1 className="text-5xl md:text-[5rem] font-black uppercase leading-[0.9] tracking-tighter text-[#1a2332] mb-10">
            <span className="text-[#cc0000]">SMART ALERT</span> & <br/>
            FIELD EMERGENCY
          </h1>
          
          <button 
            onClick={() => onNavigate('register')}
            className="group flex items-center justify-center gap-2 bg-[#cc0000] text-white px-10 py-4 text-sm font-bold uppercase tracking-widest rounded hover:bg-[#a30000] transition-colors w-full sm:w-auto mb-6"
          >
            Get Protected Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView()}
              className="flex items-center justify-center px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#1a2332] bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              Learn How It Works
            </button>
            <button 
              disabled
              className="flex items-center justify-center px-8 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 bg-white border border-gray-200 rounded cursor-not-allowed w-full sm:w-auto"
            >
              App Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* The Problem Section (Dark Blue) */}
      <section className="w-full py-20 px-6 md:px-12 bg-[#1a2332] text-white flex flex-col items-center text-center">
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 text-white">
            WHY TRADITIONAL CALLS FAIL.
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            During a severe emergency...
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#1f2937] p-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-[#cc0000] rounded-full flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-xl mb-2 text-white">Instant Response</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Instant response on the calls and attainment.</p>
            </div>
            
            <div className="bg-[#1f2937] p-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-[#cc0000] rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-xl mb-2 text-white">Pinpoint Accuracy</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Pinpoint accuracy to instant environments.</p>
            </div>
            
            <div className="bg-[#1f2937] p-8 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="w-12 h-12 bg-[#cc0000] rounded-full flex items-center justify-center mb-6">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-xl mb-2 text-white">Offline Mesh</h4>
              <p className="text-sm text-gray-400 leading-relaxed">Offline mesh is ultimate ecrm and attach nary.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Survival */}
      <section id="how-it-works" className="w-full py-24 px-6 md:px-12 bg-white flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#1a2332] mb-12">
            BUILT FOR SURVIVAL.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#cc0000] rounded-full flex items-center justify-center mb-6">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-[#1a2332]">AI SEVERITY TRIAGE</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                AI severity triage to identify meaning and arrtomance a security unit. AI severity control.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#cc0000] rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-[#1a2332]">LIVE GPS TRACKING</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Live GPS tracking is news and automatus by widassagreus cash red onaine devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* A Unified Ecosystem / Red Footer Area */}
      <section className="w-full py-20 px-6 md:px-12 bg-[#e31818] text-white flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8">
          A UNIFIED ECOSYSTEM.
        </h2>
        
        <div className="bg-white text-center p-10 rounded-xl shadow-xl max-w-lg w-full mb-16">
          <h3 className="text-2xl font-black uppercase tracking-tight text-[#1a2332] mb-2">JOIN THE GRID</h3>
          <p className="text-gray-500 text-sm font-medium mb-6">Sign up for S.A.F.E. and JOIN THE GRID.</p>
          <button 
            onClick={() => onNavigate('register')}
            className="w-full bg-[#1a2332] text-white px-6 py-4 text-xs font-bold uppercase tracking-wider rounded hover:bg-[#0f1520] transition-colors"
          >
            SIGN UP NOW
          </button>
        </div>
        
        {/* Footer */}
        <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center border-t border-red-500/50 pt-8 mt-4 gap-6">
          <div className="flex items-center gap-3">
            <span className="font-black text-2xl tracking-tighter uppercase">S.A.F.E.</span>
            {/* Mockup KWASU logo container */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-700/80 rounded-full flex items-center justify-center border border-yellow-500">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="leading-none text-left">
                <span className="block text-[0.6rem] font-bold text-yellow-500 uppercase tracking-tight">Kwasu State</span>
                <span className="block text-[0.6rem] font-bold text-white uppercase tracking-tight">University</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => onNavigate('admin-login')}
            className="text-xs font-bold uppercase tracking-widest text-red-200 hover:text-white transition-colors"
          >
            Admin Console
          </button>
        </div>
      </section>

    </div>
  );
}
