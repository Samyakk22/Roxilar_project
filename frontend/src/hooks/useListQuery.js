import { useCallback, useEffect, useState } from 'react';
import api, { parseApiError } from '../api/client';
import useDebounce from './useDebounce';

/**
 * Fetches a server-filtered, server-sorted list.
 * Returns filters/sort state plus setters and the loaded rows.
 */
export default function useListQuery(url, { initialFilters = {}, initialSort }) {
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedFilters = useDebounce(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(url, { params: { ...debouncedFilters, sortBy: sort.sortBy, order: sort.order } })
      .then(({ data }) => {
        if (!cancelled) {
          setRows(data);
          setError('');
        }
      })
      .catch((err) => !cancelled && setError(parseApiError(err).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [url, debouncedFilters, sort, reloadKey]);

  const toggleSort = useCallback((key) => {
    setSort((prev) => ({
      sortBy: key,
      order: prev.sortBy === key && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const setFilter = useCallback((name, value) => setFilters((f) => ({ ...f, [name]: value })), []);
  const resetFilters = useCallback(() => setFilters(initialFilters), [initialFilters]);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { rows, setRows, loading, error, filters, setFilter, resetFilters, sort, toggleSort, reload };
}
