import React from 'react';
import { ArrowRight, Shield, Zap } from 'lucide-react';
import { cn } from '../../utils/cn'; // Assume we have a cn utility

interface LandingHeroProps {
  onNavigate: (path: string) => void;
}

export const LandingHero = ({ onNavigate }: LandingHeroProps) => {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 border border-border shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span>S.A.F.E. Grid Active & Live</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl">
          When seconds count, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-foreground">
            Traditional calls fail.
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          Smart Alert & Field Emergency (S.A.F.E.) bypasses the cellular bottleneck, utilizing AI triage and offline mesh networking to guarantee your SOS is heard.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('register')}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Join the Grid
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => {
              document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-secondary/80 transition-all"
          >
            See how it works
          </button>
        </div>

      </div>

      {/* Hero Visual / Mockup */}
      <div className="w-full max-w-5xl mx-auto mt-20 px-6 relative z-10">
        <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-2 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="rounded-xl overflow-hidden border border-border/50 bg-background relative aspect-[16/9] md:aspect-[21/9] flex items-center justify-center">
            {/* Abstract visual representing the mesh network */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
            <div className="flex items-center justify-center gap-8 text-muted-foreground opacity-50">
              <div className="p-6 rounded-full bg-secondary animate-pulse duration-1000">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <div className="w-32 h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
              <div className="p-6 rounded-full bg-secondary">
                <Zap className="w-12 h-12 text-accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
