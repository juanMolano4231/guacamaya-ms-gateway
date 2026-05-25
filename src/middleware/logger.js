'use strict';

const morgan = require('morgan');

/**
 * HTTP request logger.
 * Uses the "combined" Apache format in production, "dev" otherwise.
 */
const logger = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

module.exports = logger;
