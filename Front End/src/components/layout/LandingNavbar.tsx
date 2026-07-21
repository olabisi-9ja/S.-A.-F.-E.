import React, { useState, useEffect } from 'react';
import { Equal, X, Shield } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LandingNavbarProps {
  onNavigate: (path: string) => void;
}

const menuItems = [
  { name: 'The Problem', href: '#problem' },
  { name: 'How it Works', href: '#workflow' },
  { name: 'Core Tech', href: '#technology' },
];

export const LandingNavbar = ({ onNavigate }: LandingNavbarProps) => {
  const [menuState, setMenuState] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 pt-4 px-2">
      <nav
        data-state={menuState ? 'active' : 'inactive'}
        className={cn(
          'mx-auto max-w-6xl px-6 py-3 transition-all duration-300 lg:px-8',
          isScrolled ? 'bg-background/80 backdrop-blur-md rounded-2xl border border-border shadow-sm' : 'bg-transparent'
        )}
      >
        <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0">
          <div className="flex w-full justify-between lg:w-auto">
            <button
              onClick={() => onNavigate('')}
              className="flex gap-2 items-center text-foreground hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold tracking-tighter text-xl">S.A.F.E.</span>
            </button>

            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState ? 'Close Menu' : 'Open Menu'}
              className="relative z-20 block cursor-pointer p-2 lg:hidden text-foreground"
            >
              <Equal className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
              <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
            </button>
          </div>

          <div className="absolute inset-0 m-auto hidden size-fit lg:block">
            <ul className="flex gap-8 text-sm font-medium">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex hidden w-full flex-wrap items-center justify-end space-y-4 rounded-xl border border-border p-6 shadow-xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-4 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="lg:hidden w-full mb-6">
              <ul className="space-y-4 text-base font-medium">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      onClick={() => setMenuState(false)}
                      className="block text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors border border-transparent"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors shadow-sm"
              >
                Get Protected
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
