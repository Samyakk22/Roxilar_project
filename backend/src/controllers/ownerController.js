const pool = require('../config/db');
const { buildListQuery } = require('../utils/listQuery');

// GET /api/owner/dashboard?sortBy=&order= — the owner's store, its average rating
// and the users who rated it.
exports.dashboard = async (req, res) => {
  const [stores] = await pool.query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating), 2) AS averageRating, COUNT(r.id) AS ratingCount
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = ?
     GROUP BY s.id`,
    [req.user.id],
  );

  if (!stores.length) return res.json({ store: null, raters: [] });
  const store = stores[0];

  const { orderBy } = buildListQuery(
    req.query,
    {},
    { name: 'u.name', email: 'u.email', address: 'u.address', rating: 'r.rating', updatedAt: 'r.updated_at' },
    'updatedAt',
  );

  const [raters] = await pool.query(
    `SELECT u.id, u.name, u.email, u.address, r.rating, r.updated_at AS ratedAt
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = ?
     ${orderBy}, u.id ASC`,
    [store.id],
  );

  res.json({ store, raters });
};
