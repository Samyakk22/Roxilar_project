/**
 * Filter inputs for list pages.
 * fields: [{ name, label, placeholder?, options?: [{ value, label }] }]
 */
export default function FilterBar({ fields, values, onChange, onReset }) {
  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()} role="search">
      {fields.map((f) => (
        <label key={f.name} className="filters__field">
          <span>{f.label}</span>
          {f.options ? (
            <select value={values[f.name] ?? ''} onChange={(e) => onChange(f.name, e.target.value)}>
              <option value="">All</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="search"
              value={values[f.name] ?? ''}
              placeholder={f.placeholder ?? `Filter by ${f.label.toLowerCase()}`}
              onChange={(e) => onChange(f.name, e.target.value)}
            />
          )}
        </label>
      ))}
      {onReset && (
        <button type="button" className="btn btn--ghost filters__reset" onClick={onReset}>
          Clear
        </button>
      )}
    </form>
  );
}
