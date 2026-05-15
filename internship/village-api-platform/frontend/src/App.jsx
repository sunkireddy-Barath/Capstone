import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/Toast';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminApiKeys from './pages/admin/ApiKeys';
import AdminApiLogs from './pages/admin/ApiLogs';
import B2BDashboard from './pages/b2b/Dashboard';
import ApiKeys from './pages/b2b/ApiKeys';
import B2BAnalytics from './pages/b2b/Analytics';
import ApiExplorer from './pages/b2b/Explorer';

function RequireAuth({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth adminOnly><AdminUsers /></RequireAuth>} />
          <Route path="/admin/api-keys" element={<RequireAuth adminOnly><AdminApiKeys /></RequireAuth>} />
          <Route path="/admin/logs" element={<RequireAuth adminOnly><AdminApiLogs /></RequireAuth>} />

          {/* B2B Client */}
          <Route path="/dashboard" element={<RequireAuth><B2BDashboard /></RequireAuth>} />
          <Route path="/dashboard/api-keys" element={<RequireAuth><ApiKeys /></RequireAuth>} />
          <Route path="/dashboard/analytics" element={<RequireAuth><B2BAnalytics /></RequireAuth>} />
          <Route path="/dashboard/explorer" element={<RequireAuth><ApiExplorer /></RequireAuth>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
