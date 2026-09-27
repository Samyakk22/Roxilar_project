import { useEffect, useState } from 'react';
import api from '../../api/client';
import Alert from '../../components/Alert';
import FormField from '../../components/FormField';
import useForm from '../../hooks/useForm';
import { validators } from '../../utils/validation';

const schema = { name: validators.name, email: validators.email, address: validators.address };

export default function AddStoreForm({ onCreated, onCancel }) {
  const [owners, setOwners] = useState([]);
  const { field, submit, formError, submitting, values } = useForm(
    { name: '', email: '', address: '', ownerId: '' },
    schema,
  );

  useEffect(() => {
    api.get('/admin/owners/available').then(({ data }) => setOwners(data)).catch(() => setOwners([]));
  }, []);

  const onSubmit = submit(async (v) => {
    const { data } = await api.post('/admin/stores', {
      name: v.name.trim(),
      email: v.email.trim(),
      address: v.address.trim(),
      ownerId: v.ownerId ? Number(v.ownerId) : null,
    });
    onCreated(data);
  });

  const { error: ownerError, ...ownerProps } = field('ownerId');

  return (
    <form onSubmit={onSubmit} noValidate>
      <Alert>{formError}</Alert>
      <FormField label="Store name" hint={`20–60 characters (${values.name.trim().length})`} {...field('name')} />
      <FormField label="Store email" type="email" {...field('email')} />
      <FormField label="Address" as="textarea" rows={3} maxLength={400} hint={`Max 400 characters (${values.address.length}/400)`} {...field('address')} />
      <FormField
        label="Store owner"
        name="ownerId"
        error={ownerError}
        hint={owners.length ? 'Optional — only store owners without a store are listed' : 'No unassigned store owners. Add a user with the Store Owner role first.'}
      >
        <select id="field-ownerId" {...ownerProps}>
          <option value="">No owner</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
          ))}
        </select>
      </FormField>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn--primary" disabled={submitting}>{submitting ? 'Saving…' : 'Add store'}</button>
      </div>
    </form>
  );
}
