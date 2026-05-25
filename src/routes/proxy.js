'use strict';

const { createProxyMiddleware } = require('http-proxy-middleware');
const { services, proxyTimeout } = require('../config/services');

/**
 * Builds and returns an Express Router that proxies every gateway prefix to
 * its corresponding upstream microservice.
 *
 * Key async behaviour:
 *   • http-proxy-middleware uses Node's native http.request under the hood,
 *     which is fully non-blocking (async I/O).
 *   • Each proxy instance is independent, so multiple in-flight requests to
 *     different services execute concurrently — no sequential blocking.
 *   • proxyTimeout / timeout options prevent a slow upstream from stalling
 *     the event loop indefinitely.
 *
 * Cookie forwarding:
 *   The downstream services rely on cookies for session/JWT.  The proxy
 *   forwards them verbatim (no stripping) and passes Set-Cookie headers from
 *   upstreams back to the client unchanged.
 */
function buildProxyRouter(app) {
  for (const service of services) {
    const { name, prefix, target, pathRewrite } = service;

    const proxyOptions = {
      target,
      changeOrigin: true,
      xfwd: true,

      ...(pathRewrite ? { pathRewrite } : {}),

      proxyTimeout,
      timeout: proxyTimeout,

      cookieDomainRewrite: {
        '*': 'localhost'
      },

      on: {
        proxyReq: (proxyReq, req) => {
          // Rewrite Host and Origin so upstream services (especially Spring)
          // don't reject the request due to CSRF/CORS origin mismatch
          proxyReq.setHeader('Host', new URL(target).host);
          if (req.headers.origin) {
            proxyReq.setHeader('Origin', target);
          }

          console.log(`[${name}] → ${req.method} ${target}${proxyReq.path}`);
        },
        proxyRes: (proxyRes, req) => {
          console.log(`[${name}] ← ${proxyRes.statusCode} ${req.method} ${req.originalUrl}`);
        },
        error: (err, req, res) => {
          console.error(`[${name}] Proxy error for ${req.method} ${req.originalUrl}: ${err.message}`);
          if (res.headersSent) return;
          res.status(502).json({
            error: true,
            status: 502,
            message: `Service "${name}" is unavailable. ${err.message}`,
            path: req.originalUrl,
            timestamp: new Date().toISOString(),
          });
        },
      },
    };

    const proxy = createProxyMiddleware(proxyOptions);

    // Mount the proxy at the gateway prefix.
    // Express matches any sub-path under the prefix (e.g. /auth/**).
    app.use(prefix, proxy);
    console.log(`[Gateway] Registered: ${prefix}  →  ${target}`);
  }
}

module.exports = buildProxyRouter;
