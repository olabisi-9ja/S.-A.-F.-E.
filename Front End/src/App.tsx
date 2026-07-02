import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated && user) {
    const isAdmin = user.role === 'security_admin' || user.role === 'super_admin';
    return <Navigate to={isAdmin ? '/admin' : '/home'} replace />;
  }

  return <>{children}</>;
}

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
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><PageWrapper component={LoginPage} /></PublicRoute>} />
        <Route path="/admin-login" element={<PublicRoute><PageWrapper component={AdminLoginPage} /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><PageWrapper component={RegisterPage} /></PublicRoute>} />
        
        {/* Redirect root to appropriate dashboard/login */}
        <Route path="/" element={<Navigate to="/home" replace />} />

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

        {/* 404 Fallback */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-50 pt-14 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold">Page not found</p>
              <a href="/" className="mt-3 text-red-700 hover:underline text-sm block">Return to home</a>
            </div>
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
