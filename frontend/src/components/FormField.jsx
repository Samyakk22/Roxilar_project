export default function FormField({ label, name, error, hint, as = 'input', children, ...props }) {
  const Control = as;
  const id = `field-${name}`;
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children ?? <Control id={id} name={name} aria-invalid={Boolean(error)} {...props} />}
      {error ? <p className="field__error">{error}</p> : hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}
