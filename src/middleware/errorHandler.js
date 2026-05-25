'use strict';

/**
 * Handles errors thrown by the proxy middleware or any other upstream failure.
 * Must be registered AFTER all routes (4-argument signature tells Express it
 * is an error handler).
 */
function errorHandler(err, req, res, next) {  // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 502;
  const message = err.message || 'Bad Gateway';

  console.error(`[Gateway Error] ${req.method} ${req.originalUrl} → ${status}: ${message}`);

  if (res.headersSent) return;

  res.status(status).json({
    error: true,
    status,
    message,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
