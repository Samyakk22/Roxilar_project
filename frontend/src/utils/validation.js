// Mirrors backend/src/validators/rules.js
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validators = {
  name: (v = '') => {
    const len = v.trim().length;
    if (!len) return 'Name is required';
    if (len < 20 || len > 60) return 'Name must be between 20 and 60 characters';
    return '';
  },
  email: (v = '') => {
    if (!v.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(v.trim())) return 'Enter a valid email address';
    return '';
  },
  address: (v = '') => {
    if (!v.trim()) return 'Address is required';
    if (v.trim().length > 400) return 'Address must be at most 400 characters';
    return '';
  },
  password: (v = '') => {
    if (!v) return 'Password is required';
    if (!PASSWORD_REGEX.test(v)) {
      return 'Password must be 8-16 characters and include an uppercase letter and a special character';
    }
    return '';
  },
  required: (label) => (v = '') => (String(v).trim() ? '' : `${label} is required`),
};

/** Runs `schema` ({ field: validatorFn }) against `values`, returning only failing fields. */
export function validate(values, schema) {
  const errors = {};
  for (const [field, fn] of Object.entries(schema)) {
    const message = fn(values[field], values);
    if (message) errors[field] = message;
  }
  return errors;
}
