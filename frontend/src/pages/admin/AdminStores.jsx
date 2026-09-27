import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Alert from '../../components/Alert';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import useListQuery from '../../hooks/useListQuery';
import { formatRating } from '../../utils/format';
import AddStoreForm from './AddStoreForm';

const INITIAL_FILTERS = { name: '', email: '', address: '' };
const FILTER_FIELDS = [
  { name: 'name', label: 'Name' },
  { name: 'email', label: 'Email' },
  { name: 'address', label: 'Address' },
];

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'address', label: 'Address', sortable: true, className: 'col-address' },
  {
    key: 'rating',
    label: 'Rating',
    sortable: true,
    render: (s) => (
      <span className="rating-cell">
        <StarRating value={s.rating} size="sm" />
        <strong>{formatRating(s.rating)}</strong>
        <small className="muted">({s.ratingCount})</small>
      </span>
    ),
  },
  {
    key: 'owner',
    label: 'Owner',
    render: (s) => (s.ownerId ? <Link to={`/admin/users/${s.ownerId}`}>{s.ownerName}</Link> : <span className="muted">—</span>),
  },
];

export default function AdminStores() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notice, setNotice] = useState('');
  const list = useListQuery('/admin/stores', { initialFilters: INITIAL_FILTERS, initialSort: { sortBy: 'name', order: 'asc' } });
  const showAdd = searchParams.get('add') === '1';
  const closeAdd = () => setSearchParams({}, { replace: true });

  return (
    <section className="page">
      <div className="page__header">
        <h1>Stores</h1>
        <button type="button" className="btn btn--primary" onClick={() => setSearchParams({ add: '1' })}>+ Add store</button>
      </div>
      <Alert type="success">{notice}</Alert>
      <Alert>{list.error}</Alert>
      <FilterBar fields={FILTER_FIELDS} values={list.filters} onChange={list.setFilter} onReset={list.resetFilters} />
      <DataTable columns={columns} rows={list.rows} sort={list.sort} onSort={list.toggleSort} loading={list.loading} emptyMessage="No stores match these filters" />

      {showAdd && (
        <Modal title="Add store" onClose={closeAdd}>
          <AddStoreForm
            onCancel={closeAdd}
            onCreated={(s) => {
              closeAdd();
              setNotice(`Store "${s.name}" was created.`);
              list.reload();
            }}
          />
        </Modal>
      )}
    </section>
  );
}
