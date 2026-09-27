import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Alert from '../../components/Alert';
import DataTable from '../../components/DataTable';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import useListQuery from '../../hooks/useListQuery';
import { ROLE_LABELS, ROLES } from '../../utils/roles';
import AddUserForm from './AddUserForm';

const INITIAL_FILTERS = { name: '', email: '', address: '', role: '' };
const FILTER_FIELDS = [
  { name: 'name', label: 'Name' },
  { name: 'email', label: 'Email' },
  { name: 'address', label: 'Address' },
  { name: 'role', label: 'Role', options: Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] })) },
];

const columns = [
  { key: 'name', label: 'Name', sortable: true, render: (u) => <Link to={`/admin/users/${u.id}`}>{u.name}</Link> },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'address', label: 'Address', sortable: true, className: 'col-address' },
  { key: 'role', label: 'Role', sortable: true, render: (u) => <span className={`badge badge--${u.role.toLowerCase()}`}>{ROLE_LABELS[u.role]}</span> },
  { key: 'actions', label: '', render: (u) => <Link className="btn btn--small" to={`/admin/users/${u.id}`}>View</Link> },
];

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notice, setNotice] = useState('');
  const list = useListQuery('/admin/users', { initialFilters: INITIAL_FILTERS, initialSort: { sortBy: 'name', order: 'asc' } });
  const showAdd = searchParams.get('add') === '1';
  const closeAdd = () => setSearchParams({}, { replace: true });

  return (
    <section className="page">
      <div className="page__header">
        <h1>Users</h1>
        <button type="button" className="btn btn--primary" onClick={() => setSearchParams({ add: '1' })}>+ Add user</button>
      </div>
      <Alert type="success">{notice}</Alert>
      <Alert>{list.error}</Alert>
      <FilterBar fields={FILTER_FIELDS} values={list.filters} onChange={list.setFilter} onReset={list.resetFilters} />
      <DataTable columns={columns} rows={list.rows} sort={list.sort} onSort={list.toggleSort} loading={list.loading} emptyMessage="No users match these filters" />

      {showAdd && (
        <Modal title="Add user" onClose={closeAdd}>
          <AddUserForm
            onCancel={closeAdd}
            onCreated={(u) => {
              closeAdd();
              setNotice(`${ROLE_LABELS[u.role]} "${u.name}" was created.`);
              list.reload();
            }}
          />
        </Modal>
      )}
    </section>
  );
}
