import { Shield, Bell, Menu, X, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user, logout } = useAuth();
  const { alerts } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const isOnline = true; // Simulated

  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  const isAdmin = user?.role === 'security_admin' || user?.role === 'super_admin';

  const userLinks = [
    { id: 'home', label: 'Home' },
    { id: 'report', label: 'Report Incident' },
    { id: 'my-incidents', label: 'My Reports' },
    { id: 'alerts', label: 'Alerts' },
  ];

  const adminLinks = [
    { id: 'admin-dashboard', label: 'Dashboard' },
    { id: 'admin-incidents', label: 'Incidents' },
    { id: 'admin-map', label: 'Campus Map' },
    { id: 'admin-analytics', label: 'Analytics' },
    { id: 'admin-users', label: 'Users' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-red-800 flex items-center px-4 md:px-6 gap-4 shadow-lg">
      {/* Logo */}
      <button
        onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'home')}
        className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:left-auto flex items-center gap-2 text-white font-extrabold tracking-widest text-sm hover:opacity-90 transition shrink-0"
      >
        <Shield className="w-5 h-5" />
        <span className="hidden sm:inline">S.A.F.E. KWASU</span>
        <span className="sm:hidden">S.A.F.E.</span>
      </button>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-1 ml-4 flex-1">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              currentPage === link.id
                ? 'bg-white/20 text-white'
                : 'text-red-200 hover:text-white hover:bg-white/10'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Network status */}
        <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
          isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span className="hidden lg:inline">{isOnline ? 'Live' : 'Mesh'}</span>
        </div>

        {/* Alerts bell */}
        <button
          onClick={() => onNavigate(isAdmin ? 'admin-incidents' : 'alerts')}
          className="relative p-2 text-red-200 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          <Bell className="w-5 h-5" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-400 text-red-900 text-xs font-bold rounded-full flex items-center justify-center">
              {unreadAlerts}
            </span>
          )}
        </button>

        {/* User name */}
        <span className="hidden md:block text-xs text-red-200 max-w-[120px] truncate">
          {user?.full_name}
        </span>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 text-red-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-red-200 hover:text-white hover:bg-white/10 rounded-lg transition"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-red-800 border-t border-red-700 py-2 px-4 md:hidden shadow-xl">
          {links.map(link => (
            <button
              key={link.id}
              onClick={() => { onNavigate(link.id); setMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition mb-0.5 ${
                currentPage === link.id
                  ? 'bg-white/20 text-white'
                  : 'text-red-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
