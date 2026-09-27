const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const { buildListQuery } = require('../utils/listQuery');

// GET /api/stores?name=&address=&sortBy=&order= — store list for normal users,
// including the overall rating and the current user's own rating.
exports.listStores = async (req, res) => {
  const { where, params, orderBy } = buildListQuery(
    req.query,
    { name: { column: 's.name' }, address: { column: 's.address' } },
    { name: 's.name', address: 's.address', rating: 'r.avg_rating', myRating: 'mine.rating' },
    'name',
  );

  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.address,
            r.avg_rating AS overallRating, COALESCE(r.rating_count, 0) AS ratingCount,
            mine.rating AS myRating
     FROM stores s
     LEFT JOIN (
       SELECT store_id, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS rating_count
       FROM ratings GROUP BY store_id
     ) r ON r.store_id = s.id
     LEFT JOIN ratings mine ON mine.store_id = s.id AND mine.user_id = ?
     ${where} ${orderBy}, s.id ASC`,
    [req.user.id, ...params],
  );
  res.json(rows);
};

// PUT /api/stores/:storeId/rating — submit or modify the current user's rating.
exports.rateStore = async (req, res) => {
  const { storeId } = req.params;
  const { rating } = req.body;

  const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
  if (!stores.length) throw new ApiError(404, 'Store not found');

  const [result] = await pool.query(
    `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
    [req.user.id, storeId, rating],
  );

  const [[summary]] = await pool.query(
    'SELECT ROUND(AVG(rating), 2) AS overallRating, COUNT(*) AS ratingCount FROM ratings WHERE store_id = ?',
    [storeId],
  );

  // affectedRows is 1 for insert, 2 for update, 0 when unchanged.
  res.status(result.affectedRows === 1 ? 201 : 200).json({ storeId, myRating: rating, ...summary });
};
