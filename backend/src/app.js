const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { clientOrigin } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: clientOrigin.split(',').map((o) => o.trim()) }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
