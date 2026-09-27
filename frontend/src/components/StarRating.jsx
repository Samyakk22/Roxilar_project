import { useState } from 'react';

/** Read-only when `onChange` is omitted; otherwise an accessible 1-5 picker. */
export default function StarRating({ value = 0, onChange, disabled, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value || 0;

  if (!onChange) {
    const rounded = Math.round(Number(value) || 0);
    return (
      <span className={`stars stars--${size}`} aria-label={value ? `${value} out of 5` : 'Not rated'}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= rounded ? 'star star--on' : 'star'}>★</span>
        ))}
      </span>
    );
  }

  return (
    <span className={`stars stars--${size} stars--input`} role="radiogroup" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= shown ? 'star star--on' : 'star'}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </span>
  );
}
