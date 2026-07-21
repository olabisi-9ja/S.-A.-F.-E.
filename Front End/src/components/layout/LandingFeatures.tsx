import React from 'react';
import { Users, Crosshair, Smartphone, BrainCircuit, Radio, Activity, Zap, Lock, MapPin, Shield } from 'lucide-react';

export const LandingFeatures = () => {
  return (
    <div className="w-full bg-background text-foreground py-24 flex flex-col gap-24 overflow-hidden">
      
      {/* Problem Section (Bento Grid) */}
      <section id="problem" className="max-w-7xl mx-auto px-6 w-full">
        <div className="mb-12">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">The Bottleneck</h2>
          <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Why Traditional Systems Fail</h3>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            In high-stress environments, calling a security dispatch line introduces fatal delays. S.A.F.E. removes the human barrier from the initial alert phase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-card border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users className="w-32 h-32" />
            </div>
            <Users className="w-8 h-8 text-primary mb-6" />
            <h4 className="text-xl font-bold mb-3">Dispatcher Overload</h4>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              During campus-wide incidents, traditional hotlines get busy. S.A.F.E. routes digital alerts directly to active field units, bypassing the switchboard entirely.
            </p>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
            <Crosshair className="w-8 h-8 text-destructive mb-6" />
            <h4 className="text-xl font-bold mb-3">Vague Locations</h4>
            <p className="text-muted-foreground leading-relaxed">
              "I'm near the science block" isn't enough. Our system pulls live, exact GPS coordinates immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="w-full bg-secondary py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">The Workflow</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Anatomy of an Alert</h3>
            <p className="text-muted-foreground text-lg">
              S.A.F.E. executes a complex, multi-tiered response protocol in under 1.5 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-border z-0"></div>

            {[
              { icon: Smartphone, title: 'Instant Activation', desc: 'A single tap generates an encrypted payload with GPS.' },
              { icon: BrainCircuit, title: 'AI Context Analysis', desc: 'Algorithms analyze history and keywords for priority.' },
              { icon: Radio, title: 'Smart / Mesh Routing', desc: 'Routes via WebSockets or falls back to peer-to-peer mesh.' },
              { icon: Activity, title: 'Live Tracking', desc: 'Security tracks your movement live as they close in.' }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-card border-2 border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3 hover:rotate-0 transition-transform">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <span className="text-primary font-bold text-xs uppercase tracking-widest mb-2">Step 0{i + 1}</span>
                <h4 className="text-lg font-bold mb-2">{step.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Tech Section */}
      <section id="technology" className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Core Tech</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-8">Architected for Resilience.</h3>
            
            <div className="space-y-8">
              {[
                { icon: Zap, title: 'Socket.io Telemetry', desc: 'Persistent WebSocket connections ensure location data is pushed instantly, rather than waiting for client-side polling intervals.' },
                { icon: Lock, title: 'End-to-End Encryption', desc: 'Payloads are encrypted at rest and in transit. Your location data is only decryptable by authorized dispatcher terminals.' },
                { icon: MapPin, title: 'Leaflet Spatial Engine', desc: 'Custom map tiles and clustering algorithms handle thousands of concurrent live markers without degrading browser performance.' }
              ].map((tech, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <tech.icon className="w-6 h-6 text-foreground" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{tech.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{tech.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
            <div className="relative bg-card border border-border p-8 rounded-3xl shadow-xl aspect-square flex flex-col items-center justify-center text-center">
              <Shield className="w-24 h-24 text-primary mb-8" />
              <h3 className="text-2xl font-bold mb-4">Enterprise Grade Security</h3>
              <p className="text-muted-foreground max-w-sm">
                Built from the ground up for university campuses and large corporate facilities.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer / CTA */}
      <section className="bg-foreground text-background py-20 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to secure your campus?</h2>
          <p className="text-muted-foreground/80 mb-10 text-lg">Join the beta program and equip your students with the tools they need.</p>
          <div className="flex flex-wrap justify-center gap-4">
             <button className="px-8 py-4 bg-background text-foreground rounded-xl font-bold hover:bg-gray-200 transition-colors">
               Get Started Now
             </button>
             <button className="px-8 py-4 bg-transparent border border-background/20 text-background rounded-xl font-bold hover:bg-background/10 transition-colors">
               Contact Sales
             </button>
          </div>
        </div>
      </section>
    </div>
  );
};
