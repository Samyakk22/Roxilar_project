import { useState } from 'react';
import api, { parseApiError } from '../../api/client';
import Alert from '../../components/Alert';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import StarRating from '../../components/StarRating';
import useListQuery from '../../hooks/useListQuery';
import { formatRating } from '../../utils/format';

const INITIAL_FILTERS = { name: '', address: '' };
const FILTER_FIELDS = [
  { name: 'name', label: 'Store name', placeholder: 'Search by name' },
  { name: 'address', label: 'Address', placeholder: 'Search by address' },
];

function RatingAction({ store, onRate, saving }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(store.myRating || 0);

  if (store.myRating && !editing) {
    return (
      <button type="button" className="btn btn--small" onClick={() => { setDraft(store.myRating); setEditing(true); }}>
        Modify rating
      </button>
    );
  }

  const save = async () => {
    if (await onRate(store, draft)) setEditing(false);
  };

  return (
    <span className="rate-action">
      <StarRating value={draft} onChange={setDraft} disabled={saving} />
      <button type="button" className="btn btn--small btn--primary" disabled={!draft || saving} onClick={save}>
        {saving ? 'Saving…' : store.myRating ? 'Update' : 'Submit'}
      </button>
      {editing && (
        <button type="button" className="btn btn--small btn--ghost" disabled={saving} onClick={() => setEditing(false)}>
          Cancel
        </button>
      )}
    </span>
  );
}

export default function StoreList() {
  const list = useListQuery('/stores', { initialFilters: INITIAL_FILTERS, initialSort: { sortBy: 'name', order: 'asc' } });
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState({ type: 'success', text: '' });

  const rate = async (store, rating) => {
    setSavingId(store.id);
    setMessage({ type: 'success', text: '' });
    try {
      const { data } = await api.put(`/stores/${store.id}/rating`, { rating });
      list.setRows((rows) => rows.map((r) => (r.id === store.id ? { ...r, ...data } : r)));
      setMessage({ type: 'success', text: `Your rating for "${store.name}" was saved.` });
      return true;
    } catch (err) {
      setMessage({ type: 'error', text: parseApiError(err).message });
      return false;
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Store name', sortable: true },
    { key: 'address', label: 'Address', sortable: true, className: 'col-address' },
    {
      key: 'rating',
      label: 'Overall rating',
      sortable: true,
      render: (s) => (
        <span className="rating-cell">
          <StarRating value={s.overallRating} size="sm" />
          <strong>{formatRating(s.overallRating)}</strong>
          <small className="muted">({s.ratingCount})</small>
        </span>
      ),
    },
    {
      key: 'myRating',
      label: 'Your rating',
      sortable: true,
      render: (s) => (s.myRating ? <strong>{s.myRating} / 5</strong> : <span className="muted">Not rated</span>),
    },
    {
      key: 'action',
      label: 'Rate',
      render: (s) => <RatingAction key={`${s.id}-${s.myRating}`} store={s} onRate={rate} saving={savingId === s.id} />,
    },
  ];

  return (
    <section className="page">
      <div className="page__header">
        <h1>Stores</h1>
      </div>
      <Alert type={message.type}>{message.text}</Alert>
      <Alert>{list.error}</Alert>
      <FilterBar fields={FILTER_FIELDS} values={list.filters} onChange={list.setFilter} onReset={list.resetFilters} />
      <DataTable columns={columns} rows={list.rows} sort={list.sort} onSort={list.toggleSort} loading={list.loading} emptyMessage="No stores found" />
    </section>
  );
}
