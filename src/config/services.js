'use strict';
require('dotenv').config();

/**
 * Each entry describes one upstream microservice:
 *   prefix   – the path the gateway exposes (stripped before forwarding)
 *   target   – where requests are forwarded
 *   pathRewrite – function that restores the prefix Express strips before
 *                 passing the request to http-proxy-middleware v3
 */
const services = [
  {
    name: 'auth',
    prefix: '/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8080',
    pathRewrite: (path) => `/auth${path}`,
  },
  {
    name: 'productos',
    prefix: '/products',
    target: process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:8082',
    pathRewrite: (path) => `/products${path}`,
  },
  {
    name: 'categorias',
    prefix: '/categories',
    target: process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:8082',
    pathRewrite: (path) => `/categories${path}`,
  },
  {
    name: 'compras',
    prefix: '/cart',
    target: process.env.COMPRAS_SERVICE_URL || 'http://localhost:8084',
    pathRewrite: (path) => `/cart${path}`,
  },
  {
    name: 'compras-admin',
    prefix: '/admin/carts',
    target: process.env.COMPRAS_SERVICE_URL || 'http://localhost:8084',
    pathRewrite: (path) => `/admin/carts${path}`,
  },
  {
    name: 'ordenes',
    prefix: '/orders',
    target: process.env.ORDENES_SERVICE_URL || 'http://localhost:8086',
    pathRewrite: (path) => `/orders${path}`,
  },
  {
    name: 'pagos',
    prefix: '/api/payments',
    target: process.env.PAGOS_SERVICE_URL || 'http://localhost:8080',
    pathRewrite: (path) => `/api/payments${path}`,
  },
  {
    name: 'pagos-by-order',
    prefix: '/api/orders',
    target: process.env.PAGOS_SERVICE_URL || 'http://localhost:8080',
    pathRewrite: (path) => `/api/orders${path}`,
  },
];

const proxyTimeout = parseInt(process.env.PROXY_TIMEOUT || '10000', 10);

module.exports = { services, proxyTimeout };
