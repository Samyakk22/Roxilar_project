/**
 * Table with clickable, server-driven sortable headers.
 * columns: [{ key, label, sortable?, render?(row), className? }]
 */
export default function DataTable({ columns, rows, sort, onSort, loading, emptyMessage = 'No records found', rowKey = 'id' }) {
  const indicator = (key) => {
    if (sort?.sortBy !== key) return <span className="sort-icon sort-icon--idle">↕</span>;
    return <span className="sort-icon">{sort.order === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sort?.sortBy === col.key;
              const ariaSort = active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none';
              return (
                <th key={col.key} className={col.className} aria-sort={col.sortable ? ariaSort : undefined}>
                  {col.sortable ? (
                    <button type="button" className="th-sort" onClick={() => onSort(col.key)}>
                      {col.label} {indicator(col.key)}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={loading ? 'is-loading' : undefined}>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                {loading ? 'Loading…' : emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className} data-label={col.label}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
