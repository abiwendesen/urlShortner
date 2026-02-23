# URL Shortener

A full-stack URL shortener that converts long URLs into compact Base62 codes and redirects users quickly using Redis caching.  
The project includes:
- An Express + MySQL + Redis backend API
- A React + Vite frontend client
- Jest + Supertest backend tests

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)
![Supertest](https://img.shields.io/badge/Supertest-222222?logo=testinglibrary&logoColor=white)

## Features

- Shortens long URLs through `POST /short`
- Generates short codes using Base62 encoding
- Redirects via `GET /:id`
- Redis cache for fast lookups
- Per-IP rate limiting (5 requests/minute on shorten endpoint)
- URL format validation middleware
- Access logging with Morgan (`access.log`)
- React frontend UI for shortening, copying, and opening links
- Automated backend tests for validation, encoding, redirect, and rate limiting

## Project Structure

```txt
UrlShortner/
|-- app.js                     # Express app setup and middleware
|-- server.js                  # Server startup
|-- controller/
|   `-- shortner.js            # Shorten + redirect controllers
|-- routes/
|   `-- urlRoutes.js           # API routes
|-- middlewares/
|   |-- urlValidator.js        # URL validation
|   `-- rateLimiter.js         # Redis-backed rate limiting
|-- db/
|   |-- database.js            # MySQL pool
|   `-- cache.js               # Redis client
|-- utills/
|   |-- base62.js              # Base62 encode/decode helpers
|   `-- urlTrim.js             # URL normalization helper
|-- test/                      # Jest + Supertest tests
`-- frontend/                  # React + Vite frontend
```

## How It Works

1. Client sends a URL to `POST /short`.
2. `validateUrl` middleware checks format.
3. `rateLimiter` middleware limits requests per IP.
4. URL is normalized (auto-adds `https://` when protocol is missing).
5. URL is inserted into MySQL.
6. Insert ID is Base62-encoded into a short code.
7. Code is written back to MySQL and cached in Redis.
8. API returns `BASE_URL + code`.

For redirects:
1. Client requests `GET /:id`.
2. Service checks Redis key `short:<id>`.
3. On cache hit, responds with `302` immediately.
4. On cache miss, loads from MySQL, caches result, then redirects `302`.

## System Design

### High-Level Architecture

```txt
[Web / Mobile Clients]
          |
          v
[CDN + DNS + TLS termination]
          |
          v
[Load Balancer]
          |
          v
[Stateless Node.js API replicas]
     |                     |
     |                     +--> [Redis Cluster] (cache + rate-limit counters)
     |
     +--> [MySQL Primary] <--> [MySQL Read Replicas]
```

### Read and Write Path Design

Shorten path (`POST /short`):
1. Validate URL and apply rate limits.
2. Persist original URL to MySQL.
3. Encode DB ID using Base62 to produce compact code.
4. Update mapping and cache hot key in Redis.
5. Return short URL immediately.

Redirect path (`GET /:id`):
1. Lookup in Redis first (`O(1)` average).
2. On miss, fetch from MySQL and hydrate cache.
3. Return HTTP `302` redirect.

This design keeps redirects fast because most traffic is read-heavy and cacheable.

### Why This Can Scale to Millions of Users

The service is designed around horizontal scaling and cache-first reads:
- API nodes are stateless, so they scale linearly behind a load balancer.
- Redis absorbs most redirect traffic, reducing DB pressure.
- MySQL handles durable writes while replicas serve heavy read traffic.
- Base62 IDs avoid expensive random-code generation and collision checks.
- Rate limiting protects the write path from abuse and burst spikes.

At scale, most URL shorteners are redirect-dominant (far more reads than writes).  
With high Redis hit rates (for example 90%+ on hot links), the backend can support very high request volume while keeping MySQL stable.

### Scalability Strategy (Production)

- Run multiple API instances (containers/VMs) across availability zones.
- Use Redis Cluster with persistence and replica failover.
- Split MySQL into one writer + multiple readers.
- Add connection pooling and strict query indexing.
- Add CDN edge caching for extremely popular redirect codes.
- Use async jobs/queues for analytics and non-critical writes.
- Add circuit breakers, request timeouts, and retry policies.

## Technical Deep Dive

### Data Model

Current table:
- `id`: auto-increment primary key
- `long_url`: destination URL
- `short_code`: Base62 code returned to clients
- `ipAddress`: client IP at creation time

Recommended indexes for scale:

```sql
ALTER TABLE shorturl
ADD UNIQUE INDEX idx_short_code (short_code(16));
```

If analytics is added, keep click events in a separate table/stream so redirect latency is unaffected.

### Caching Model

- Cache key format: `short:<code>`
- Rate-limit key format: `rate:<ip>`
- URL cache TTL: `36000` seconds
- Rate-limit window: `60` seconds, `5` requests per IP

For million-user scale:
- Use Redis memory policies (`allkeys-lru` or `volatile-lru` based on TTL strategy)
- Monitor hit/miss ratio and p99 latency
- Warm cache for top links after deploy/restart

### Reliability and Operations

- Health checks: `/health` endpoint (recommended addition)
- Observability: logs + metrics + tracing
- Alerts: Redis memory, DB CPU, p95/p99 latency, 5xx error rate
- Backups: scheduled MySQL backups + Redis persistence strategy
- Security: Helmet, input validation, secret management via env/secret manager

### Suggested SLO Targets

- Redirect success rate: `>= 99.95%`
- Redirect p95 latency: `< 100 ms` (cache hit path)
- API error rate: `< 0.1%`
- Cache hit ratio: `>= 90%` for active links

## API Documentation

### `POST /short`

Create a shortened URL.

Request body:

```json
{
  "url": "https://example.com/very/long/path"
}
```

Success response (`201`):

```json
{
  "message": "http://localhost:5000/1t"
}
```

Validation error (`400`):

```json
{
  "message": "Invalid URL please use the correct format (eg. https://google.com)"
}
```

Rate limit error (`429`):

```json
{
  "message": "Too many requests"
}
```

### `GET /:id`

Redirects to the original URL.

- Success: HTTP `302` redirect
- Not found (`404`):

```json
{
  "message": "URL NOT FOUND"
}
```

## Environment Variables

Create a `.env` file in the project root:

```env
HOST=localhost
USER=your_mysql_user
PASSWORD=your_mysql_password
DBNAME=urlshortner
BASE_URL=http://localhost:5000/
PORT=5000
CONNECTION_LIMIT=100
```

## Database Setup

Create a MySQL database and a table used by the app.

Example:

```sql
CREATE DATABASE urlshortner;
USE urlshortner;

CREATE TABLE shorturl (
  id INT PRIMARY KEY AUTO_INCREMENT,
  long_url TEXT NOT NULL,
  short_code VARCHAR(32) UNIQUE,
  ipAddress VARCHAR(64)
);
```

## Local Setup

### 1. Start backend

From project root:

```bash
npm install
npm start
```

Backend runs on `http://localhost:5000`.

### 2. Start frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

Vite proxy forwards `/api/*` to backend `http://localhost:5000/*`.

## Testing

Run backend tests from project root:

```bash
npm test
```

Current tests cover:
- URL validation failure
- Redirect behavior (`302`)
- Not found behavior (`404`)
- Base62 encode/decode correctness
- Rate limiter behavior (`429` after 5 shorten requests)

## Notes

- Redis server must be running at `redis://localhost:6379`.
- MySQL must be running and accessible with your `.env` credentials.
- Logs are written to `access.log`.
- The backend currently uses IP-based throttling via Redis.

## Frontend

The React app provides:
- Input for long URL
- Submit action to call `/api/short`
- Copy shortened URL
- Open shortened URL in a new tab
- Inline loading and error handling states

---

If you want, I can also add:
- request/response sequence diagram
- sample Postman collection section
- deployment guide (Render/Railway/Vercel + managed Redis/MySQL)
