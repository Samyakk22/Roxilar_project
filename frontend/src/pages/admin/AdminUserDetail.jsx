import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { parseApiError } from '../../api/client';
import Alert from '../../components/Alert';
import StarRating from '../../components/StarRating';
import { formatDate, formatRating } from '../../utils/format';
import { ROLE_LABELS, ROLES } from '../../utils/roles';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setUser(null);
    setError('');
    api
      .get(`/admin/users/${id}`)
      .then(({ data }) => setUser(data))
      .catch((err) => setError(parseApiError(err).message));
  }, [id]);

  return (
    <section className="page page--narrow">
      <Link to="/admin/users" className="back-link">← Back to users</Link>
      <h1>User details</h1>
      <Alert>{error}</Alert>
      {!user && !error && <p className="muted">Loading…</p>}
      {user && (
        <div className="card">
          <dl className="details">
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Address</dt>
            <dd className="pre-wrap">{user.address}</dd>
            <dt>Role</dt>
            <dd><span className={`badge badge--${user.role.toLowerCase()}`}>{ROLE_LABELS[user.role]}</span></dd>
            {user.role === ROLES.OWNER && (
              <>
                <dt>Store</dt>
                <dd>{user.store ? user.store.name : <span className="muted">No store assigned</span>}</dd>
                <dt>Rating</dt>
                <dd className="rating-cell">
                  <StarRating value={user.rating} />
                  <strong>{formatRating(user.rating)}</strong>
                  <small className="muted">({user.ratingCount} rating{user.ratingCount === 1 ? '' : 's'})</small>
                </dd>
              </>
            )}
            <dt>Member since</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </dl>
        </div>
      )}
    </section>
  );
}
