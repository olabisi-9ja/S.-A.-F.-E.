import { Shield, ArrowRight, Activity, MapPin, Zap, Radio, BrainCircuit } from 'lucide-react';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-red-600 selection:text-white overflow-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="w-full py-6 px-6 md:px-12 flex justify-between items-center z-50">
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
            className="text-sm font-bold uppercase tracking-wider bg-gray-900 text-white px-5 py-2 hover:bg-red-600 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-6 md:px-12 relative mt-8 md:mt-0">
        
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[50vw] h-[100vh] bg-red-50 -z-10 translate-x-1/4 skew-x-[-10deg]"></div>

        <div className="max-w-5xl pt-12 pb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter text-gray-900 mb-8">
            Smart Alert <br/>
            & Fast <br/>
            <span className="text-red-600">Emergency</span>
          </h1>
          
          <div className="space-y-6 max-w-2xl mb-12 border-l-4 border-red-600 pl-6">
            <p className="text-lg md:text-xl font-medium text-gray-600 leading-relaxed">
              The S.A.F.E. application is built exclusively for Kwara State University (KWASU) students and staff to ensure rapid response during critical situations. 
            </p>
            <p className="text-base md:text-lg font-normal text-gray-500 leading-relaxed">
              Instead of making phone calls or struggling to describe your location, a single tap instantly transmits your exact GPS coordinates directly to the campus security dashboard. The system utilizes AI to categorize the urgency of your report, and if you completely lose internet connectivity, our offline Bluetooth mesh network will automatically bounce your SOS signal across nearby student devices until it reaches safety.
            </p>
          </div>
          
          <button 
            onClick={() => onNavigate('register')}
            className="group inline-flex items-center gap-4 bg-red-600 text-white px-8 py-4 text-lg font-black uppercase tracking-wider hover:bg-gray-900 transition-all duration-300"
          >
            Create Your Account
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 max-w-6xl mt-auto mb-12 border border-gray-100">
          
          <div className="bg-white p-8 group hover:bg-red-600 transition-colors duration-300 cursor-default">
            <Zap className="w-8 h-8 text-red-600 mb-6 group-hover:text-white transition-colors" strokeWidth={2.5} />
            <h3 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-white">One-Tap SOS</h3>
            <p className="text-gray-500 font-medium leading-relaxed group-hover:text-red-100 text-sm">
              Press the SOS button and the system automatically grabs your GPS location and sends an immediate high-priority alert to the security control room.
            </p>
          </div>

          <div className="bg-white p-8 group hover:bg-gray-900 transition-colors duration-300 cursor-default">
            <Radio className="w-8 h-8 text-red-600 mb-6 group-hover:text-red-500 transition-colors" strokeWidth={2.5} />
            <h3 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-white">Offline Mesh</h3>
            <p className="text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 text-sm">
              If your phone has no data or Wi-Fi, the app uses Bluetooth to pass your encrypted alert to nearby phones until someone with a connection can upload it.
            </p>
          </div>

          <div className="bg-white p-8 group hover:bg-red-50 transition-colors duration-300 cursor-default">
            <MapPin className="w-8 h-8 text-red-600 mb-6" strokeWidth={2.5} />
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">Admin Tracking</h3>
            <p className="text-gray-500 font-medium leading-relaxed text-sm">
              Security personnel have access to a live interactive map dashboard where they can see exactly where emergencies are happening and coordinate response teams.
            </p>
          </div>

          <div className="bg-white p-8 group hover:bg-gray-100 transition-colors duration-300 cursor-default">
            <BrainCircuit className="w-8 h-8 text-red-600 mb-6" strokeWidth={2.5} />
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">AI Triage</h3>
            <p className="text-gray-500 font-medium leading-relaxed text-sm">
              When reporting specific incidents (like medical emergencies or fires), our integrated AI reads your description and assigns a severity level automatically.
            </p>
          </div>

        </div>
      </main>

      <footer className="w-full py-6 px-6 md:px-12 flex justify-between items-center border-t border-gray-100 bg-white mt-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Kwara State University Security
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
