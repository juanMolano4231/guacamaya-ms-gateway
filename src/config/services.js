'use strict';
require('dotenv').config();

/**
 * Each entry describes one upstream microservice:
 *   prefix   – the path the gateway exposes (stripped before forwarding)
 *   target   – where requests are forwarded
 *   pathRewrite – restores the stripped prefix while avoiding unwanted
 *                 trailing slashes on root routes.
 */

function rewrite(prefix) {
  return (path) => (
    path === '/' ? prefix : `${prefix}${path}`
  );
}

const services = [
  {
    name: 'auth',
    prefix: '/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8080',
    pathRewrite: rewrite('/auth'),
  },

  {
    name: 'productos',
    prefix: '/products',
    target: process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:8082',
    pathRewrite: rewrite('/products'),
  },

  {
    name: 'categorias',
    prefix: '/categories',
    target: process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:8082',
    pathRewrite: rewrite('/categories'),
  },

  {
    name: 'compras',
    prefix: '/cart',
    target: process.env.COMPRAS_SERVICE_URL || 'http://localhost:8084',
    pathRewrite: rewrite('/cart'),
  },

  {
    name: 'compras-admin',
    prefix: '/admin/carts',
    target: process.env.COMPRAS_SERVICE_URL || 'http://localhost:8084',
    pathRewrite: rewrite('/admin/carts'),
  },

  {
    name: 'ordenes',
    prefix: '/orders',
    target: process.env.ORDENES_SERVICE_URL || 'http://localhost:8086',
    pathRewrite: rewrite('/orders'),
  },

  {
    name: 'pagos',
    prefix: '/api/payments',
    target: process.env.PAGOS_SERVICE_URL || 'http://localhost:8080',
    pathRewrite: rewrite('/api/payments'),
  },

  {
    name: 'pagos-by-order',
    prefix: '/api/orders',
    target: process.env.PAGOS_SERVICE_URL || 'http://localhost:8080',
    pathRewrite: rewrite('/api/orders'),
  },
];

const proxyTimeout = parseInt(
  process.env.PROXY_TIMEOUT || '10000',
  10
);

module.exports = { services, proxyTimeout };