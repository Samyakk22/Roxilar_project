import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import { validators } from '../utils/validation';

const schema = {
  name: validators.name,
  email: validators.email,
  address: validators.address,
  password: validators.password,
  confirmPassword: (v, values) => (v === values.password ? '' : 'Passwords do not match'),
};

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { field, submit, formError, submitting, values } = useForm(
    { name: '', email: '', address: '', password: '', confirmPassword: '' },
    schema,
  );

  const onSubmit = submit(async ({ name, email, address, password }) => {
    await register({ name: name.trim(), email: email.trim(), address: address.trim(), password });
    navigate('/stores', { replace: true });
  });

  return (
    <div className="auth">
      <form className="card auth__card" onSubmit={onSubmit} noValidate>
        <h1>Create your account</h1>
        <p className="muted">Sign up to discover and rate stores.</p>
        <Alert>{formError}</Alert>
        <FormField label="Full name" hint={`20–60 characters (${values.name.trim().length})`} autoComplete="name" {...field('name')} />
        <FormField label="Email" type="email" autoComplete="email" {...field('email')} />
        <FormField label="Address" as="textarea" rows={3} maxLength={400} hint={`Max 400 characters (${values.address.length}/400)`} {...field('address')} />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="8–16 characters, at least one uppercase letter and one special character"
          {...field('password')}
        />
        <FormField label="Confirm password" type="password" autoComplete="new-password" {...field('confirmPassword')} />
        <button className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
        <p className="auth__switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
