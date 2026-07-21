import { useEffect } from 'react';
import { LandingNavbar } from '../components/layout/LandingNavbar';
import { LandingHero } from '../components/layout/LandingHero';
import { LandingFeatures } from '../components/layout/LandingFeatures';

export function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  // Smooth scroll
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = 'auto'; }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col overflow-x-hidden relative">
      <LandingNavbar onNavigate={onNavigate} />
      <LandingHero onNavigate={onNavigate} />
      <LandingFeatures />
    </div>
  );
}
