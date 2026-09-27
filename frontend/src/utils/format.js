export const formatRating = (value) => (value == null ? '—' : Number(value).toFixed(1));

export const formatDate = (value) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
