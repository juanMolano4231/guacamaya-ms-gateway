'use strict';

require('dotenv').config();

/**
 * Each entry describes one upstream microservice:
 *   prefix   – the path the gateway exposes (stripped before forwarding)
 *   target   – where requests are forwarded
 *   pathRewrite – optional path rewrite rules (key = regex, value = replacement)
 *
 * The gateway strips the gateway prefix and rewrites to the service's own
 * root path so every microservice keeps its original route structure intact.
 */
const services = [
  {
    name: 'auth',
    prefix: '/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8081',
    // /auth/login  →  /auth/login  (service uses /auth/* internally)
    pathRewrite: null,
  },
  {
    name: 'productos',
    prefix: '/products',
    target: process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:8082',
    // /products/… → /products/…  (service exposes /products and /categories)
    pathRewrite: null,
  },
  {
    name: 'categorias',
    prefix: '/categories',
    target: process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:8082',
    pathRewrite: null,
  },
  {
    name: 'compras',
    prefix: '/cart',
    target: process.env.COMPRAS_SERVICE_URL || 'http://localhost:8084',
    pathRewrite: null,
  },
  {
    name: 'compras-admin',
    prefix: '/admin/carts',
    target: process.env.COMPRAS_SERVICE_URL || 'http://localhost:8084',
    pathRewrite: null,
  },
  {
    name: 'ordenes',
    prefix: '/orders',
    target: process.env.ORDENES_SERVICE_URL || 'http://localhost:8086',
    pathRewrite: null,
  },
  {
    name: 'pagos',
    prefix: '/api/payments',
    target: process.env.PAGOS_SERVICE_URL || 'http://localhost:8088',
    pathRewrite: null,
  },
  {
    name: 'pagos-by-order',
    prefix: '/api/orders',
    target: process.env.PAGOS_SERVICE_URL || 'http://localhost:8088',
    pathRewrite: null,
  },
];

const proxyTimeout = parseInt(process.env.PROXY_TIMEOUT || '10000', 10);

module.exports = { services, proxyTimeout };
