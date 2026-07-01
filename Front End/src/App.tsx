import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// User pages
import { HomePage } from './pages/user/HomePage';
import { ReportPage } from './pages/user/ReportPage';
import { MyIncidentsPage } from './pages/user/MyIncidentsPage';
import { AlertsPage } from './pages/AlertsPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminIncidentsPage } from './pages/admin/AdminIncidentsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminMapPage } from './pages/admin/AdminMapPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

const ADMIN_PAGES = ['admin-dashboard', 'admin-incidents', 'admin-analytics', 'admin-map', 'admin-users'];
const USER_PAGES = ['home', 'report', 'my-incidents', 'alerts'];
const ALL_PAGES = [...ADMIN_PAGES, ...USER_PAGES];

function Router() {
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState('login');

  const isAdmin = user?.role === 'security_admin' || user?.role === 'super_admin';

  useEffect(() => {
    if (isAuthenticated && user) {
      setPage(isAdmin ? 'admin-dashboard' : 'home');
    } else {
      setPage('login');
    }
  }, [isAuthenticated, user, isAdmin]);

  const navigate = (p: string) => setPage(p);

  // Unauthenticated routes
  if (!isAuthenticated) {
    if (page === 'admin-login') return <AdminLoginPage onNavigate={navigate} />;
    if (page === 'register') return <RegisterPage onNavigate={navigate} />;
    return <LoginPage onNavigate={navigate} />;
  }

  const renderPage = () => {
    // Admin pages
    if (isAdmin) {
      if (page === 'admin-dashboard') return <AdminDashboard onNavigate={navigate} />;
      if (page === 'admin-incidents') return <AdminIncidentsPage onNavigate={navigate} />;
      if (page === 'admin-analytics') return <AdminAnalyticsPage />;
      if (page === 'admin-map') return <AdminMapPage />;
      if (page === 'admin-users') return <AdminUsersPage />;
    }

    // User pages
    if (!isAdmin) {
      if (page === 'home') return <HomePage onNavigate={navigate} />;
      if (page === 'report') return <ReportPage onNavigate={navigate} />;
      if (page === 'my-incidents') return <MyIncidentsPage onNavigate={navigate} />;
    }

    // Shared
    if (page === 'alerts') return <AlertsPage />;

    // Fallback
    if (!ALL_PAGES.includes(page)) {
      return (
        <div className="min-h-screen bg-gray-50 pt-14 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-semibold">Page not found</p>
            <button
              onClick={() => navigate(isAdmin ? 'admin-dashboard' : 'home')}
              className="mt-3 text-red-700 hover:underline text-sm"
            >
              Return to dashboard
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="font-sans antialiased">
      <Navbar currentPage={page} onNavigate={navigate} />
      <main>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </AuthProvider>
  );
}
