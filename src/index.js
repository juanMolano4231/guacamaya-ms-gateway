'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const cookieParser = require('cookie-parser');

const logger       = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const buildProxyRouter = require('./routes/proxy');

// ─── App ────────────────────────────────────────────────────────────────────

const app = express();

// ─── Global middleware ───────────────────────────────────────────────────────

// CORS — allow configured origins (default: all) and pass credentials so
// cookies (used by the session/JWT microservices) are forwarded properly.
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map(o => o.trim()),
  credentials: true,
}));

// Parse cookies so they are available in logs / future middleware.
app.use(cookieParser());

// HTTP request logger.
app.use(logger);

// ─── Health-check ────────────────────────────────────────────────────────────

/**
 * GET /health
 * Quick liveness probe for load-balancers and monitoring tools.
 * Returns the status of the gateway itself, not of the upstream services.
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    gateway: 'guacamaya-gateway',
    timestamp: new Date().toISOString(),
    services: {
      auth:      process.env.AUTH_SERVICE_URL      || 'http://localhost:8081',
      productos: process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:8082',
      compras:   process.env.COMPRAS_SERVICE_URL   || 'http://localhost:8084',
      ordenes:   process.env.ORDENES_SERVICE_URL   || 'http://localhost:8086',
      pagos:     process.env.PAGOS_SERVICE_URL     || 'http://localhost:8088',
    },
  });
});

// ─── Proxy routes ────────────────────────────────────────────────────────────

/**
 * Register one proxy middleware per microservice.
 * All requests are forwarded asynchronously — Node's non-blocking I/O means
 * concurrent requests to different (or the same) services proceed in parallel
 * without blocking each other.
 *
 * Route → Service mapping:
 *   /auth/**            →  ms-auth       :8081
 *   /products/**        →  ms-productos  :8082
 *   /categories/**      →  ms-productos  :8082
 *   /cart/**            →  ms-compras    :8084
 *   /admin/carts/**     →  ms-compras    :8084
 *   /orders/**          →  ms-ordenes    :8086
 *   /api/payments/**    →  ms-pagos      :8088
 *   /api/orders/**      →  ms-pagos      :8088  (GET /api/orders/:id/payments)
 */
buildProxyRouter(app);

// ─── 404 for unmatched routes ────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    error: true,
    status: 404,
    message: 'Route not found in gateway',
  });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║         Guacamaya API Gateway started            ║');
  console.log(`║  Listening on http://localhost:${PORT}              ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log('Registered routes:');
  console.log('  /health            →  (gateway health check)');
  console.log('  /auth/**           →  ms-auth       :8081');
  console.log('  /products/**       →  ms-productos  :8082');
  console.log('  /categories/**     →  ms-productos  :8082');
  console.log('  /cart/**           →  ms-compras    :8084');
  console.log('  /admin/carts/**    →  ms-compras    :8084');
  console.log('  /orders/**         →  ms-ordenes    :8086');
  console.log('  /api/payments/**   →  ms-pagos      :8088');
  console.log('  /api/orders/**     →  ms-pagos      :8088');
  console.log('');
});

module.exports = app; // export for testing
