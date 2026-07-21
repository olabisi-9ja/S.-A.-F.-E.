import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';

// Public pages
import { LandingPage } from './pages/LandingPage';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// User pages
import { HomePage } from './pages/user/HomePage';
import { ReportPage } from './pages/user/ReportPage';
import { MyIncidentsPage } from './pages/user/MyIncidentsPage';
import { LiveTrackerPage } from './pages/user/LiveTrackerPage';
import { AlertsPage } from './pages/AlertsPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminIncidentsPage } from './pages/admin/AdminIncidentsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminMapPage } from './pages/admin/AdminMapPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user.role === 'security_admin' || user.role === 'super_admin';

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  if (!requireAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Connecting...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const isAdmin = user.role === 'security_admin' || user.role === 'super_admin';
    return <Navigate to={isAdmin ? '/admin' : '/home'} replace />;
  }

  return <>{children}</>;
}

import { AiChatbot } from './components/AiChatbot';

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  // Strip leading slash for the navbar current page prop to match old behavior
  const currentPage = location.pathname.substring(1) || 'home';
  const navigate = useNavigate();

  return (
    <div className="font-sans antialiased">
      <Navbar currentPage={currentPage} onNavigate={(path) => navigate(`/${path}`)} />
      <main>
        {children}
      </main>
      <AiChatbot />
    </div>
  );
}

function PageWrapper({ component: Component }: { component: any }) {
  const navigate = useNavigate();
  return <Component onNavigate={(path: string) => navigate(`/${path}`)} />;
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root / directly to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><PageWrapper component={LoginPage} /></PublicRoute>} />
        <Route path="/admin-login" element={<PublicRoute><PageWrapper component={AdminLoginPage} /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><PageWrapper component={RegisterPage} /></PublicRoute>} />
        <Route path="/auth/verify" element={<PublicRoute><PageWrapper component={VerifyEmailPage} /></PublicRoute>} />

        {/* User Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><AppLayout><PageWrapper component={HomePage} /></AppLayout></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><AppLayout><PageWrapper component={ReportPage} /></AppLayout></ProtectedRoute>} />
        <Route path="/my-incidents" element={<ProtectedRoute><AppLayout><PageWrapper component={MyIncidentsPage} /></AppLayout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AppLayout><AlertsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><AppLayout><PageWrapper component={MyIncidentsPage} /></AppLayout></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AppLayout><PageWrapper component={AdminDashboard} /></AppLayout></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/admin-incidents" element={<ProtectedRoute requireAdmin><AppLayout><PageWrapper component={AdminIncidentsPage} /></AppLayout></ProtectedRoute>} />
        <Route path="/admin-analytics" element={<ProtectedRoute requireAdmin><AppLayout><AdminAnalyticsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/admin-map" element={<ProtectedRoute requireAdmin><AppLayout><AdminMapPage /></AppLayout></ProtectedRoute>} />
        <Route path="/admin-users" element={<ProtectedRoute requireAdmin><AppLayout><AdminUsersPage /></AppLayout></ProtectedRoute>} />

        {/* Live Tracking (Public/Shared) */}
        <Route path="/track/:id" element={<LiveTrackerPage />} />

        {/* 404 Fallback */}
        <Route path="*" element={
          <div className="min-h-screen bg-white pt-14 flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl font-black text-red-600">404</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
              The page you are looking for doesn't exist or has been moved. Please check the URL or return to safety.
            </p>
            <a href="/" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-sm">
              Return Home
            </a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
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
