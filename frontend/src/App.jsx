import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStores from './pages/admin/AdminStores';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminUsers from './pages/admin/AdminUsers';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import Signup from './pages/Signup';
import StoreList from './pages/user/StoreList';
import { HOME_BY_ROLE, ROLES } from './utils/roles';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading…</div>;
  return <Navigate to={user ? HOME_BY_ROLE[user.role] : '/login'} replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/password" element={<ChangePassword />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/stores" element={<AdminStores />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.USER]} />}>
            <Route path="/stores" element={<StoreList />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.OWNER]} />}>
            <Route path="/owner" element={<OwnerDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
