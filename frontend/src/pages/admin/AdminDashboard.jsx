import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { parseApiError } from '../../api/client';
import Alert from '../../components/Alert';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(parseApiError(err).message));
  }, []);

  const cards = [
    { label: 'Total users', value: stats?.totalUsers, to: '/admin/users' },
    { label: 'Total stores', value: stats?.totalStores, to: '/admin/stores' },
    { label: 'Total ratings submitted', value: stats?.totalRatings },
  ];

  return (
    <section className="page">
      <div className="page__header">
        <h1>Admin dashboard</h1>
        <div className="actions">
          <Link className="btn btn--primary" to="/admin/users?add=1">+ Add user</Link>
          <Link className="btn btn--primary" to="/admin/stores?add=1">+ Add store</Link>
        </div>
      </div>
      <Alert>{error}</Alert>
      <div className="stats">
        {cards.map((c) => {
          const body = (
            <>
              <span className="stat__value">{stats ? c.value : '…'}</span>
              <span className="stat__label">{c.label}</span>
            </>
          );
          return c.to ? (
            <Link key={c.label} to={c.to} className="card stat stat--link">{body}</Link>
          ) : (
            <div key={c.label} className="card stat">{body}</div>
          );
        })}
      </div>
    </section>
  );
}
