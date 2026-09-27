import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME_BY_ROLE } from '../utils/roles';

/** Renders child routes only for authenticated users whose role is in `roles` (if given). */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  return <Outlet />;
}

/** Redirects already-authenticated users away from login/signup. */
export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  if (user) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;
  return <Outlet />;
}
