import { useState } from 'react';
import { parseApiError } from '../api/client';
import { validate } from '../utils/validation';

/**
 * Small form helper: controlled values, client-side validation using `schema`,
 * and mapping of server-side field errors back onto inputs.
 */
export default function useForm(initialValues, schema) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
  };

  const handleBlur = (e) => {
    const fn = schema[e.target.name];
    if (!fn) return;
    const message = fn(values[e.target.name], values);
    setErrors((prev) => {
      const { [e.target.name]: _removed, ...rest } = prev;
      return message ? { ...rest, [e.target.name]: message } : rest;
    });
  };

  const submit = (onValid) => async (e) => {
    e.preventDefault();
    const nextErrors = validate(values, schema);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await onValid(values);
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setErrors(fieldErrors);
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setFormError('');
  };

  const field = (name) => ({ name, value: values[name] ?? '', onChange: handleChange, onBlur: handleBlur, error: errors[name] });

  return { values, errors, formError, submitting, field, submit, reset, setFormError };
}
