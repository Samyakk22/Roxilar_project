import { Link, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import { HOME_BY_ROLE } from '../utils/roles';
import { validators } from '../utils/validation';

const schema = { email: validators.email, password: validators.required('Password') };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { field, submit, formError, submitting } = useForm({ email: '', password: '' }, schema);

  const onSubmit = submit(async ({ email, password }) => {
    const user = await login(email.trim(), password);
    const from = location.state?.from?.pathname;
    navigate(from && from.startsWith(HOME_BY_ROLE[user.role]) ? from : HOME_BY_ROLE[user.role], { replace: true });
  });

  return (
    <div className="auth">
      <form className="card auth__card" onSubmit={onSubmit} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to rate and manage stores.</p>
        <Alert>{formError}</Alert>
        <FormField label="Email" type="email" autoComplete="email" autoFocus {...field('email')} />
        <FormField label="Password" type="password" autoComplete="current-password" {...field('password')} />
        <button className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Log in'}
        </button>
        <p className="auth__switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
