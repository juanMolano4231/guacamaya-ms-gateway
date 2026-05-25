# Guacamaya API Gateway

A lightweight Express.js API Gateway that routes all external traffic to the
five Guacamaya microservices asynchronously.

## Architecture

```
Client
  │
  ▼
┌─────────────────────────────────────────────────────┐
│              API Gateway  :3000                     │
│                                                     │
│  /auth/**          →  ms-auth       :8081  (Java)  │
│  /products/**      →  ms-productos  :8082  (Node)  │
│  /categories/**    →  ms-productos  :8082  (Node)  │
│  /cart/**          →  ms-compras    :8084  (Python)│
│  /admin/carts/**   →  ms-compras    :8084  (Python)│
│  /orders/**        →  ms-ordenes    :8086  (Python)│
│  /api/payments/**  →  ms-pagos      :8088  (TS)   │
│  /api/orders/**    →  ms-pagos      :8088  (TS)   │
└─────────────────────────────────────────────────────┘
```

## Quick start

```bash
npm install
npm start          # production
npm run dev        # development (nodemon)
```

## Configuration

Copy `.env.example` to `.env` and adjust the upstream URLs:

| Variable              | Default                  | Description                         |
|-----------------------|--------------------------|-------------------------------------|
| `PORT`                | `3000`                   | Gateway listening port              |
| `AUTH_SERVICE_URL`    | `http://localhost:8081`  | ms-auth base URL                    |
| `PRODUCTOS_SERVICE_URL`| `http://localhost:8082` | ms-productos base URL               |
| `COMPRAS_SERVICE_URL` | `http://localhost:8084`  | ms-compras base URL                 |
| `ORDENES_SERVICE_URL` | `http://localhost:8086`  | ms-ordenes base URL                 |
| `PAGOS_SERVICE_URL`   | `http://localhost:8088`  | ms-pagos base URL                   |
| `PROXY_TIMEOUT`       | `10000`                  | Upstream timeout in ms              |
| `CORS_ORIGIN`         | `*`                      | Allowed CORS origins (comma-sep)    |

## Docker

```bash
# Gateway only (upstream services must be reachable)
docker build -t guacamaya-gateway .
docker run -p 3000:3000 --env-file .env guacamaya-gateway

# Full stack (edit docker-compose.yml to point to your service images/paths)
docker compose up --build
```

## Routes

### Auth  (`ms-auth` — Java/Spring, port 8081)
| Method | Gateway path         | Description        |
|--------|----------------------|--------------------|
| POST   | /auth/register       | Register user      |
| POST   | /auth/login          | Login              |
| POST   | /auth/refresh        | Refresh token      |

### Products  (`ms-productos` — Node.js, port 8082)
| Method | Gateway path         | Description            |
|--------|----------------------|------------------------|
| GET    | /categories          | List categories        |
| POST   | /categories          | Create category (admin)|
| GET    | /products            | List products          |
| GET    | /products/:id        | Get product by ID      |
| POST   | /products            | Create product (admin) |
| PUT    | /products/:id        | Update product (admin) |
| DELETE | /products/:id        | Delete product (admin) |

### Cart  (`ms-compras` — Python/Flask, port 8084)
| Method | Gateway path         | Description             |
|--------|----------------------|-------------------------|
| GET    | /cart                | Get own cart            |
| DELETE | /cart                | Delete own cart         |
| POST   | /cart/items          | Add item to cart        |
| PUT    | /cart/items/:id      | Update item quantity    |
| DELETE | /cart/items/:id      | Remove item             |
| GET    | /cart/total          | Get cart total          |
| GET    | /admin/carts         | List all carts (admin)  |
| DELETE | /admin/carts/:id     | Delete any cart (admin) |

### Orders  (`ms-ordenes` — Python/Flask, port 8086)
| Method | Gateway path         | Description             |
|--------|----------------------|-------------------------|
| POST   | /orders              | Create order            |
| GET    | /orders              | Get own orders          |
| GET    | /orders/:id          | Get order detail        |
| PUT    | /orders/:id/status   | Update status (admin)   |

### Payments  (`ms-pagos` — TypeScript/Node, port 8088)
| Method | Gateway path                  | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /api/payments                 | Create payment           |
| GET    | /api/payments/:id             | Get payment by ID        |
| PATCH  | /api/payments/:id             | Update payment (admin)   |
| GET    | /api/orders/:id/payments      | Get payments by order    |

### Gateway
| Method | Gateway path | Description     |
|--------|--------------|-----------------|
| GET    | /health      | Liveness check  |

## How async proxying works

Node.js is single-threaded but uses non-blocking I/O for all network operations.
`http-proxy-middleware` builds on Node's built-in `http.request`, which is fully
asynchronous. This means:

- Requests to different services run concurrently — no service blocks another.
- A slow upstream (e.g., ms-pagos taking 2 s) does **not** delay a simultaneous
  request to ms-auth.
- `PROXY_TIMEOUT` sets a hard ceiling so a hung upstream is rejected quickly.
