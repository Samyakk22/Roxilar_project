const app = require('./app');
const pool = require('./config/db');
const { port } = require('./config/env');

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.error('Unable to connect to MySQL:', err.message);
    process.exit(1);
  }
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

start();
