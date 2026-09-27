import { useCallback, useEffect, useState } from 'react';
import api, { parseApiError } from '../../api/client';
import Alert from '../../components/Alert';
import DataTable from '../../components/DataTable';
import StarRating from '../../components/StarRating';
import { formatDate, formatRating } from '../../utils/format';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'address', label: 'Address', sortable: true, className: 'col-address' },
  {
    key: 'rating',
    label: 'Rating',
    sortable: true,
    render: (r) => (
      <span className="rating-cell">
        <StarRating value={r.rating} size="sm" /> <strong>{r.rating}</strong>
      </span>
    ),
  },
  { key: 'updatedAt', label: 'Rated on', sortable: true, render: (r) => formatDate(r.ratedAt) },
];

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [sort, setSort] = useState({ sortBy: 'updatedAt', order: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/owner/dashboard', { params: sort })
      .then(({ data: d }) => {
        setData(d);
        setError('');
      })
      .catch((err) => setError(parseApiError(err).message))
      .finally(() => setLoading(false));
  }, [sort]);

  const toggleSort = useCallback(
    (key) => setSort((p) => ({ sortBy: key, order: p.sortBy === key && p.order === 'asc' ? 'desc' : 'asc' })),
    [],
  );

  if (!data) {
    return (
      <section className="page">
        <h1>Store dashboard</h1>
        <Alert>{error}</Alert>
        {!error && <p className="muted">Loading…</p>}
      </section>
    );
  }

  if (!data.store) {
    return (
      <section className="page page--narrow center">
        <h1>Store dashboard</h1>
        <div className="card">
          <p>No store is linked to your account yet.</p>
          <p className="muted">Please contact a system administrator to assign your store.</p>
        </div>
      </section>
    );
  }

  const { store, raters } = data;

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>{store.name}</h1>
          <p className="muted">{store.address} · {store.email}</p>
        </div>
      </div>
      <Alert>{error}</Alert>
      <div className="stats">
        <div className="card stat">
          <span className="stat__value">{formatRating(store.averageRating)}</span>
          <StarRating value={store.averageRating} />
          <span className="stat__label">Average rating</span>
        </div>
        <div className="card stat">
          <span className="stat__value">{store.ratingCount}</span>
          <span className="stat__label">Total ratings</span>
        </div>
      </div>
      <h2>Users who rated your store</h2>
      <DataTable
        columns={columns}
        rows={raters}
        sort={sort}
        onSort={toggleSort}
        loading={loading}
        emptyMessage="No ratings yet"
      />
    </section>
  );
}
