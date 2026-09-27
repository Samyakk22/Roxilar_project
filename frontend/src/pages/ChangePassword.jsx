import { useState } from 'react';
import api from '../api/client';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import useForm from '../hooks/useForm';
import { validators } from '../utils/validation';

const schema = {
  currentPassword: validators.required('Current password'),
  newPassword: (v, values) =>
    validators.password(v) || (v === values.currentPassword ? 'New password must differ from the current password' : ''),
  confirmPassword: (v, values) => (v === values.newPassword ? '' : 'Passwords do not match'),
};

const initial = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePassword() {
  const [success, setSuccess] = useState('');
  const { field, submit, formError, submitting, reset } = useForm(initial, schema);

  const onSubmit = submit(async ({ currentPassword, newPassword }) => {
    setSuccess('');
    const { data } = await api.put('/auth/password', { currentPassword, newPassword });
    reset();
    setSuccess(data.message);
  });

  return (
    <section className="page page--narrow">
      <h1>Change password</h1>
      <form className="card" onSubmit={onSubmit} noValidate>
        <Alert>{formError}</Alert>
        <Alert type="success">{success}</Alert>
        <FormField label="Current password" type="password" autoComplete="current-password" {...field('currentPassword')} />
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="8–16 characters, at least one uppercase letter and one special character"
          {...field('newPassword')}
        />
        <FormField label="Confirm new password" type="password" autoComplete="new-password" {...field('confirmPassword')} />
        <button className="btn btn--primary" disabled={submitting}>
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}
