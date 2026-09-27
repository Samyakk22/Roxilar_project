import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, ROLES } from '../utils/roles';

const LINKS = {
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/stores', label: 'Stores' },
  ],
  [ROLES.USER]: [{ to: '/stores', label: 'Stores' }],
  [ROLES.OWNER]: [{ to: '/owner', label: 'Dashboard' }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <span className="navbar__brand">★ StoreRatings</span>
        {user && (
          <>
            <nav className="navbar__links">
              {LINKS[user.role].map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end}>
                  {link.label}
                </NavLink>
              ))}
              <NavLink to="/password">Change Password</NavLink>
            </nav>
            <div className="navbar__user">
              <span className="navbar__who">
                {user.name}
                <small>{ROLE_LABELS[user.role]}</small>
              </span>
              <button type="button" className="btn btn--ghost" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
