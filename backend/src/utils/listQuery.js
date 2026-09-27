/**
 * Builds WHERE / ORDER BY fragments for list endpoints from query params.
 * Only whitelisted columns are ever interpolated into SQL; values are parameterised.
 *
 * @param {object} query        req.query
 * @param {object} filters      { param: { column, exact? } }
 * @param {object} sortable     { param: sqlExpression }
 * @param {string} defaultSort  key of `sortable`
 */
function buildListQuery(query, filters, sortable, defaultSort) {
  const clauses = [];
  const params = [];

  for (const [param, { column, exact }] of Object.entries(filters)) {
    const value = typeof query[param] === 'string' ? query[param].trim() : '';
    if (!value) continue;
    if (exact) {
      clauses.push(`${column} = ?`);
      params.push(value);
    } else {
      clauses.push(`${column} LIKE ?`);
      params.push(`%${value.replace(/[\\%_]/g, '\\$&')}%`);
    }
  }

  const sortKey = Object.hasOwn(sortable, query.sortBy) ? query.sortBy : defaultSort;
  const order = String(query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  return {
    where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
    orderBy: `ORDER BY ${sortable[sortKey]} ${order}`,
  };
}

module.exports = { buildListQuery };
