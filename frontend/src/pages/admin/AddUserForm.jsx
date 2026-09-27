import api from '../../api/client';
import Alert from '../../components/Alert';
import FormField from '../../components/FormField';
import useForm from '../../hooks/useForm';
import { ROLE_LABELS, ROLES } from '../../utils/roles';
import { validators } from '../../utils/validation';

const schema = {
  name: validators.name,
  email: validators.email,
  address: validators.address,
  password: validators.password,
  role: validators.required('Role'),
};

export default function AddUserForm({ onCreated, onCancel }) {
  const { field, submit, formError, submitting, values } = useForm(
    { name: '', email: '', address: '', password: '', role: ROLES.USER },
    schema,
  );

  const onSubmit = submit(async (v) => {
    const { data } = await api.post('/admin/users', {
      ...v,
      name: v.name.trim(),
      email: v.email.trim(),
      address: v.address.trim(),
    });
    onCreated(data);
  });

  const { error: roleError, ...roleProps } = field('role');

  return (
    <form onSubmit={onSubmit} noValidate>
      <Alert>{formError}</Alert>
      <FormField label="Name" hint={`20–60 characters (${values.name.trim().length})`} {...field('name')} />
      <FormField label="Email" type="email" {...field('email')} />
      <FormField label="Address" as="textarea" rows={3} maxLength={400} hint={`Max 400 characters (${values.address.length}/400)`} {...field('address')} />
      <FormField
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="8–16 characters, at least one uppercase letter and one special character"
        {...field('password')}
      />
      <FormField label="Role" name="role" error={roleError}>
        <select id="field-role" {...roleProps}>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </FormField>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn--primary" disabled={submitting}>{submitting ? 'Saving…' : 'Add user'}</button>
      </div>
    </form>
  );
}
