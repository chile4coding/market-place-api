**ONLINE MARKETPLACE PLATFORM**

Production-Ready Project Planning Document

*Node.js | REST API | Scalable Architecture*

| Stack Node.js \+ Express | Architecture Clean 3-Layer | Timeline \~14–18 Weeks |
| :---: | :---: | :---: |

# **1\. Project Overview**

This document provides a complete production-ready technical plan for building an Online Marketplace Platform API using Node.js. It covers architecture decisions, system design, data modeling, security, performance, and deployment strategies.

### **Core Objectives**

* Enable buyers to browse, search, filter, and purchase products

* Enable sellers to create and manage product listings, track orders

* Provide secure admin tooling for platform-wide management

* Handle transactions, reviews, ratings, and notifications

* Scale horizontally to handle thousands of concurrent users

# **2\. Technology Stack**

| Layer | Technology | Purpose |
| :---- | :---- | :---- |
| Runtime | Node.js 20 LTS | JavaScript server runtime |
| Framework | Express.js | HTTP server & routing |
| Language | TypeScript | Type safety & better DX |
| Primary DB | PostgreSQL 16 | Relational data (users, orders, products) |
| Cache | Redis 7 | Session store, caching, queues |
| Queue | BullMQ (Redis-backed) | Background jobs (emails, notifications) |
| File Storage | AWS S3 / Cloudinary | Product images & media |
| Auth | JWT \+ bcrypt | Authentication & password hashing |
| OAuth | Passport.js | Google / Facebook OAuth 2.0 |
| ORM | Prisma | Type-safe DB queries & migrations |
| Validation | Zod | Schema validation for all inputs |
| Docs | Swagger / OpenAPI 3.0 | Auto-generated API documentation |
| Email | Nodemailer \+ SendGrid | Transactional emails |
| Payments | Stripe | Secure payment processing |
| Testing | Jest \+ Supertest | Unit and integration tests |
| Containerization | Docker \+ Docker Compose | Dev environment & deployment |
| CI/CD | GitHub Actions | Automated build, test, deploy |

# **3\. System Architecture**

## **3.1 Clean 3-Layer Architecture**

Every feature in the codebase follows a strict separation of concerns across three layers. This ensures testability, maintainability, and scalability.

| Layer | Responsibility | Example Files |
| :---- | :---- | :---- |
| Routes / Controllers | Handle HTTP requests, call services, return responses | auth.routes.ts, product.controller.ts |
| Services (Business Logic) | Core logic, rules, orchestration — no DB calls directly | auth.service.ts, order.service.ts |
| Repositories (Data Access) | All DB queries live here, returns domain objects | user.repository.ts, product.repository.ts |

## **3.2 Folder Structure**

| src/   config/          \# env, db, redis, stripe config   modules/     auth/          \# routes, controller, service, repository     users/     products/     orders/     reviews/     admin/     payments/   middleware/       \# auth, error, rate-limit, upload   jobs/             \# BullMQ workers & processors   utils/            \# helpers, logger, mailer   types/            \# TypeScript interfaces & types   app.ts            \# Express app setup   server.ts         \# Entry point prisma/             \# Schema \+ migrations tests/              \# Unit \+ integration tests docker-compose.yml .env.example |
| :---- |

# **4\. Database Design**

## **4.1 Core Entities & Relationships**

| Table | Key Fields | Relationships |
| :---- | :---- | :---- |
| users | id, email, password\_hash, role, is\_verified, mfa\_secret | has many: orders, products, reviews, addresses |
| profiles | user\_id, first\_name, last\_name, phone, avatar\_url | belongs to: users (1:1) |
| addresses | id, user\_id, street, city, state, country, postal\_code, is\_default | belongs to: users |
| categories | id, name, slug, parent\_id, description, image\_url | self-referencing (nested categories) |
| products | id, seller\_id, category\_id, title, slug, description, price, stock, status | belongs to: users, category; has many: images, reviews, order\_items |
| product\_images | id, product\_id, url, is\_primary, sort\_order | belongs to: products |
| orders | id, buyer\_id, status, subtotal, tax, shipping\_fee, total, payment\_intent\_id | belongs to: users; has many: order\_items |
| order\_items | id, order\_id, product\_id, quantity, unit\_price, subtotal | belongs to: orders, products |
| payments | id, order\_id, stripe\_payment\_id, amount, currency, status, method | belongs to: orders (1:1) |
| reviews | id, product\_id, user\_id, rating (1-5), title, body, is\_verified\_purchase | belongs to: products, users |
| notifications | id, user\_id, type, title, body, is\_read, metadata (JSONB) | belongs to: users |
| refresh\_tokens | id, user\_id, token\_hash, expires\_at, is\_revoked, device\_info | belongs to: users |

## **4.2 Indexing Strategy**

Proper indexes are critical for query performance at scale. The following indexes must be created in migrations:

* products: INDEX on (category\_id), (seller\_id), (status), (price), (created\_at)

* products: FULL TEXT INDEX on (title, description) for search

* orders: INDEX on (buyer\_id), (status), (created\_at)

* reviews: INDEX on (product\_id), (user\_id), UNIQUE on (product\_id, user\_id)

* users: UNIQUE on (email), INDEX on (role), (is\_verified)

* refresh\_tokens: INDEX on (token\_hash), INDEX on (user\_id, is\_revoked)

# **5\. API Endpoint Design**

## **5.1 Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
| :---- | :---- | :---- | :---- |
| POST | /api/v1/auth/register | Register new user | No |
| POST | /api/v1/auth/verify-email | Verify email with token | No |
| POST | /api/v1/auth/login | Login with email \+ password | No |
| POST | /api/v1/auth/mfa/setup | Set up MFA (TOTP) | Yes |
| POST | /api/v1/auth/mfa/verify | Verify MFA token | Yes |
| POST | /api/v1/auth/refresh | Refresh access token | No (refresh token) |
| POST | /api/v1/auth/logout | Invalidate refresh token | Yes |
| POST | /api/v1/auth/forgot-password | Send password reset email | No |
| POST | /api/v1/auth/reset-password | Reset password with token | No |
| GET | /api/v1/auth/google | Initiate Google OAuth | No |

## **5.2 Product Endpoints**

| Method | Endpoint | Description | Auth Required |
| :---- | :---- | :---- | :---- |
| GET | /api/v1/products | List products with filter, sort, paginate | No |
| GET | /api/v1/products/search | Full-text search products | No |
| GET | /api/v1/products/:id | Get single product detail | No |
| POST | /api/v1/products | Create product listing | Seller |
| PUT | /api/v1/products/:id | Update product | Seller (owner) |
| DELETE | /api/v1/products/:id | Delete product | Seller (owner) |
| POST | /api/v1/products/:id/images | Upload product images (S3) | Seller (owner) |
| GET | /api/v1/categories | List all categories (nested) | No |

## **5.3 Order & Payment Endpoints**

| Method | Endpoint | Description | Auth Required |
| :---- | :---- | :---- | :---- |
| POST | /api/v1/orders | Create new order (triggers Stripe) | Buyer |
| GET | /api/v1/orders | List buyer's orders (paginated) | Buyer |
| GET | /api/v1/orders/:id | Get order detail | Buyer (owner) |
| POST | /api/v1/orders/:id/cancel | Cancel order (if eligible) | Buyer |
| POST | /api/v1/payments/webhook | Stripe webhook handler | Stripe Signature |
| GET | /api/v1/sellers/orders | Seller's incoming orders | Seller |
| PATCH | /api/v1/sellers/orders/:id/status | Update order status (ship, deliver) | Seller |

# **6\. Security Architecture**

## **6.1 Authentication & Authorization**

* JWT Access Tokens: short-lived (15 min), signed with RS256 (asymmetric keys)

* Refresh Tokens: long-lived (7 days), stored as hashed value in DB, rotated on every use

* Role-Based Access Control (RBAC): roles are buyer, seller, admin

* MFA: TOTP-based (Google Authenticator compatible) using speakeasy library

* OAuth 2.0: Passport.js strategies for Google (and optionally Facebook)

## **6.2 API Security Measures**

| Threat | Mitigation |
| :---- | :---- |
| Brute force login | Rate limiting per IP: 5 attempts / 15 min (express-rate-limit \+ Redis) |
| SQL Injection | Prisma ORM with parameterized queries — no raw SQL unless explicitly safe |
| XSS | Helmet.js headers, input sanitization with DOMPurify on text fields |
| CSRF | SameSite=Strict cookies for web clients; CSRF tokens for form submissions |
| Insecure file uploads | Multer \+ file type validation, scan with ClamAV, store only on S3 |
| Stripe webhook spoofing | Verify stripe-signature header on every webhook event |
| Sensitive data exposure | Never return password\_hash, mfa\_secret, or token fields in any response |
| Mass assignment | Whitelist all DTO fields with Zod; never spread req.body directly into DB |
| CORS abuse | Allowlist specific origins; credentials only on trusted domains |

# **7\. Caching Strategy (Redis)**

Redis is used for multiple purposes. Each use case has a defined key pattern and TTL (time-to-live):

| Cache Use Case | Key Pattern | TTL | Invalidation Trigger |
| :---- | :---- | :---- | :---- |
| Product detail page | product:{id} | 10 min | Product update / delete |
| Product listing / search | products:list:{hash\_of\_query} | 5 min | Any product change |
| Category tree | categories:tree | 1 hour | Admin category change |
| User session data | session:{userId} | 15 min | Logout / token refresh |
| Rate limit counters | ratelimit:{ip}:{endpoint} | 15 min | Expires automatically |
| Email verification token | verify:{token} | 24 hours | Token used or expired |
| Password reset token | reset:{token} | 1 hour | Token used or expired |
| Seller stats / dashboard | seller:{id}:stats | 30 min | New order received |

| 💡  Cache-Aside Pattern (Used Throughout) 1\. Check Redis cache first 2\. If HIT: return cached data immediately 3\. If MISS: query PostgreSQL, store result in Redis with TTL, return data 4\. On mutation: delete or update affected cache keys (never stale-serve critical data) |
| :---- |

# **8\. Background Jobs (BullMQ)**

All slow, non-blocking operations are offloaded to BullMQ workers. This keeps API response times fast (under 200ms) and prevents timeout failures.

| Queue Name | Jobs / Events | Triggered By |
| :---- | :---- | :---- |
| email-queue | Welcome email, Email verification, Password reset, Order confirmation, Shipping update | Auth events, Order events |
| notification-queue | In-app notifications for buyers, sellers, and admins | Order status changes, reviews |
| image-queue | Resize & optimize uploaded images, Generate thumbnails, Move to S3 | Product image upload |
| order-queue | Auto-cancel unpaid orders after 30 min, Remind user of abandoned cart | Order creation, Timer expiry |
| analytics-queue | Record product views, Update search ranking scores, Aggregate seller stats | Product view events |

# **9\. Error Handling & Logging**

## **9.1 Centralized Error Handling**

All errors are thrown as custom AppError instances and caught by a single global Express error middleware. This ensures consistent error response shape across all endpoints:

| // All error responses follow this shape: {   "success": false,   "statusCode": 400,   "error": "VALIDATION\_ERROR",   "message": "Price must be a positive number",   "details": \[...\],   // field-level Zod errors   "requestId": "uuid" // for tracing in logs } |
| :---- |

## **9.2 Logging**

* Use Winston for structured JSON logging (never console.log in production)

* Log levels: error, warn, info, http, debug (controlled by LOG\_LEVEL env var)

* Every request gets a unique X-Request-ID header — included in all log lines

* Integrate with Datadog, Sentry, or Logtail for production log aggregation

* Never log sensitive data: passwords, tokens, card numbers, PII

# **10\. Testing Strategy**

| Test Type | Tool | What to Cover | Target Coverage |
| :---- | :---- | :---- | :---- |
| Unit Tests | Jest | Services & utility functions in isolation (mock all dependencies) | 90%+ |
| Integration Tests | Jest \+ Supertest | Full request → DB flow per endpoint (use test DB) | 80%+ |
| Auth Tests | Jest \+ Supertest | JWT flow, MFA, token refresh, role enforcement | 100% |
| Payment Tests | Jest \+ Stripe CLI | Webhook handling, payment intent lifecycle | 100% |
| Load Tests | k6 or Artillery | Simulate 500+ concurrent users on critical endpoints | Pass SLA |

# **11\. Deployment & DevOps**

## **11.1 Environment Strategy**

| Environment | Purpose | Infrastructure |
| :---- | :---- | :---- |
| Development | Local dev with hot reload | Docker Compose (Node, PostgreSQL, Redis) |
| Staging | Pre-production testing, QA | AWS ECS or Railway (mirrors prod) |
| Production | Live users | AWS ECS \+ RDS \+ ElastiCache \+ S3 |

## **11.2 CI/CD Pipeline (GitHub Actions)**

* On every Pull Request: run lint, type-check, unit tests, integration tests

* On merge to main: build Docker image, push to ECR, deploy to staging

* On release tag: deploy to production with zero-downtime rolling update

* Secrets managed via AWS Secrets Manager — never hardcoded in code or CI config

## **11.3 Key Environment Variables**

| Variable | Description |
| :---- | :---- |
| DATABASE\_URL | PostgreSQL connection string (Prisma) |
| REDIS\_URL | Redis connection string |
| JWT\_PRIVATE\_KEY | RS256 private key for signing access tokens |
| JWT\_PUBLIC\_KEY | RS256 public key for verifying access tokens |
| STRIPE\_SECRET\_KEY | Stripe API key |
| STRIPE\_WEBHOOK\_SECRET | Stripe webhook signing secret |
| AWS\_S3\_BUCKET | S3 bucket name for product images |
| SENDGRID\_API\_KEY | Email delivery API key |
| MFA\_APP\_NAME | App name shown in authenticator apps |
| CORS\_ORIGIN | Comma-separated list of allowed frontend origins |

# **12\. Development Timeline**

| Phase | Weeks | Deliverables |
| :---- | :---- | :---- |
| Phase 0: Setup | Week 1 | Repo structure, Docker, Prisma schema, CI pipeline skeleton, Swagger setup |
| Phase 1: Auth | Weeks 2–3 | Register, email verification, login, JWT, refresh tokens, MFA, OAuth |
| Phase 2: Users & Profiles | Week 4 | Profile CRUD, address management, avatar upload |
| Phase 3: Products | Weeks 5–6 | Product CRUD, categories, image upload (S3), search & filtering |
| Phase 4: Orders | Weeks 7–8 | Cart logic, order creation, Stripe integration, webhook handling |
| Phase 5: Reviews | Week 9 | Review/rating CRUD, verified purchase check, aggregate ratings |
| Phase 6: Admin | Week 10 | Admin dashboard endpoints, user/product/order management |
| Phase 7: Background Jobs | Week 11 | BullMQ setup, email queue, image queue, order timeout queue |
| Phase 8: Caching | Week 12 | Redis caching layer, cache invalidation, rate limiting |
| Phase 9: Testing | Weeks 13–14 | Unit tests, integration tests, load tests, coverage reports |
| Phase 10: Hardening | Weeks 15–16 | Security audit, performance profiling, logging, monitoring |
| Phase 11: Deploy | Weeks 17–18 | Docker production build, CI/CD to staging, then production |

# **13\. Production Readiness Checklist**

| ✅  Security All endpoints protected by appropriate RBAC middleware Input validated with Zod on every route Rate limiting active on auth and public endpoints Stripe webhooks verified with signature HTTPS enforced; HTTP redirects to HTTPS Secrets in environment variables, not in code No sensitive data in logs or API responses |
| :---- |

| ✅  Reliability Database connection pooling configured (Prisma: max 10 connections) Redis connection with retry and reconnect logic BullMQ jobs have retry policies (3 attempts, exponential backoff) Health check endpoint: GET /health returns DB \+ Redis status Graceful shutdown handler for SIGTERM Database migrations run automatically on deploy |
| :---- |

| ✅  Performance All N+1 query patterns eliminated (use Prisma includes, not sequential loops) Database indexes confirmed via EXPLAIN ANALYZE on slow queries Redis caching active for product listing and detail endpoints Image uploads processed asynchronously via BullMQ Pagination required on all list endpoints (max 50 items/page) Compression middleware (gzip) enabled |
| :---- |

| ✅  Observability Structured JSON logging with Winston Request ID tracing on every request Error tracking via Sentry Uptime monitoring via Better Uptime or Checkly API docs live at /api/docs (Swagger UI) Test coverage report in CI — PRs fail below 80% |
| :---- |

***You're ready to build. Start with Phase 0\. Ship incrementally.***