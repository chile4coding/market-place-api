# Marketplace Platform API - Detailed Implementation Plan

Based on the Marketplace_Project_Plan.md and current codebase analysis, this document outlines the detailed implementation plan for completing the Online Marketplace Platform API.

## Current Status Analysis

### Completed Modules:
1. **Authentication Module** (`src/modules/auth/`) - Fully implemented
   - Controllers, Services, Repositories, Routes, Schema
   - Includes registration, email verification, login, JWT, refresh tokens, MFA, OAuth
   - Email worker setup with BullMQ

2. **Users Module** (`src/modules/users/`) - Partially implemented
   - Profile management (CRUD)
   - Address management (CRUD)
   - Avatar upload/delete functionality
   - Missing: Role-based functionality (buyer/seller specific features)

### Infrastructure in Place:
- Express app with middleware (helmet, cors, requestId, error handling)
- Database connection (Prisma with PostgreSQL)
- Redis connection and setup
- Swagger/OpenAPI documentation setup
- Health check endpoint
- Graceful shutdown handling
- Environment configuration

### Database Schema:
All core models defined in `prisma/schema.prisma`:
- User, Profile, Address
- Category, Product, ProductImage
- Order, OrderItem, Payment
- Review, Notification, RefreshToken
- EmailVerification, PasswordReset

## Implementation Plan by Phase

Following the timeline from Marketplace_Project_Plan.md (~14-18 weeks), we'll implement the remaining features:

### Phase 0: Setup (Already Complete)
✅ Repository structure, Docker, Prisma schema, CI pipeline skeleton, Swagger setup

### Phase 1: Auth (Already Complete)
✅ Register, email verification, login, JWT, refresh tokens, MFA, OAuth

### Phase 2: Users & Profiles (Partially Complete)
✅ Profile CRUD, address management, avatar upload
🔄 **Remaining:**
- Buyer/Seller role differentiation in user service
- Seller dashboard/profile features
- Buyer wishlist/favorites (if required)

### Phase 3: Products (Weeks 5-6) - **NEXT**
🔄 **To Implement:**
1. **Product Module Structure:**
   - `src/modules/products/` with controller, service, repository, routes, schema, types

2. **Product Features:**
   - Product CRUD operations (with seller ownership validation)
   - Draft/Active/Inactive/Deleted status management
   - Category association
   - Price, stock, description fields
   - Slug generation for SEO-friendly URLs

3. **Product Images:**
   - Image upload endpoint (using existing Multer setup)
   - Multiple images per product
   - Primary image designation
   - Sort order for image gallery

4. **Categories:**
   - Category CRUD (admin-controlled)
   - Nested/hierarchical categories support
   - Category listing with tree structure

5. **Search & Filtering:**
   - Full-text search on title/description
   - Filter by category, price range, status
   - Sorting options (price, date, relevance)
   - Pagination (limit/offset)

6. **API Endpoints to Implement:**
   - GET `/api/v1/products` - List products with filter/sort/paginate
   - GET `/api/v1/products/search` - Full-text search
   - GET `/api/v1/products/:id` - Product detail
   - POST `/api/v1/products` - Create product (Seller only)
   - PUT `/api/v1/products/:id` - Update product (Seller owner only)
   - DELETE `/api/v1/products/:id` - Delete product (Seller owner only)
   - POST `/api/v1/products/:id/images` - Upload product images
   - GET `/api/v1/categories` - List all categories (nested)

### Phase 4: Orders (Weeks 7-8)
🔄 **To Implement:**
1. **Order Module Structure:**
   - `src/modules/orders/` with controller, service, repository, routes, schema, types

2. **Cart Logic:**
   - Temporary cart storage (Redis-based or database)
   - Add/remove/update cart items
   - Cart persistence for authenticated users

3. **Order Creation:**
   - Create order from cart
   - Calculate subtotal, tax, shipping, total
   - Generate Stripe payment intent
   - Stock reservation/decrement

4. **Stripe Integration:**
   - Payment intent creation
   - Webhook handler for payment confirmation
   - Payment status tracking
   - Refund processing

5. **Order Management:**
   - Order status progression (PENDING → CONFIRMED → SHIPPED → DELIVERED)
   - Order cancellation (with eligibility rules)
   - Order history for buyers
   - Seller's incoming orders view

6. **API Endpoints to Implement:**
   - POST `/api/v1/orders` - Create new order
   - GET `/api/v1/orders` - List buyer's orders
   - GET `/api/v1/orders/:id` - Get order detail
   - POST `/api/v1/orders/:id/cancel` - Cancel order
   - POST `/api/v1/payments/webhook` - Stripe webhook
   - GET `/api/v1/sellers/orders` - Seller's incoming orders
   - PATCH `/api/v1/sellers/orders/:id/status` - Update order status

### Phase 5: Reviews (Week 9)
🔄 **To Implement:**
1. **Review Module Structure:**
   - `src/modules/reviews/` with controller, service, repository, routes, schema, types

2. **Review Features:**
   - Rating (1-5 stars)
   - Title and body text
   - Verified purchase flag
   - Review moderation capabilities

3. **Business Logic:**
   - Only verified purchasers can leave reviews (optional)
   - Aggregate rating calculation for products
   - Review helpfulness voting (if required)
   - Report/inappropriate content flagging

4. **API Endpoints to Implement:**
   - GET `/api/v1/products/:id/reviews` - List product reviews
   - POST `/api/v1/products/:id/reviews` - Create review
   - PUT `/api/v1/reviews/:id` - Update review
   - DELETE `/api/v1/reviews/:id` - Delete review
   - GET `/api/v1/reviews/:id` - Get single review

### Phase 6: Admin (Week 10)
🔄 **To Implement:**
1. **Admin Module Structure:**
   - `src/modules/admin/` with controller, service, repository, routes, schema, types

2. **Admin Features:**
   - User management (view, suspend, role changes)
   - Product management (view all, moderate, remove)
   - Order management (view all, intervene)
   - Category management (CRUD)
   - System statistics/dashboard

3. **RBAC Enhancements:**
   - Admin role verification middleware
   - Admin-only endpoints protection
   - Audit logging for admin actions

4. **API Endpoints to Implement:**
   - GET `/api/v1/admin/users` - List all users
   - GET `/api/v1/admin/users/:id` - Get user detail
   - PUT `/api/v1/admin/users/:id/status` - Suspend/activate user
   - GET `/api/v1/admin/products` - List all products
   - GET `/api/v1/admin/orders` - List all orders
   - GET `/api/v1/admin/stats` - System statistics
   - GET `/api/v1/admin/reports` - Various reports

### Phase 7: Background Jobs (Week 11)
🔄 **To Implement:**
1. **Extend Existing BullMQ Setup:**
   - Already have email worker started in server.ts

2. **Additional Queues to Implement:**
   - **notification-queue**: In-app notifications
   - **image-queue**: Image processing/resizing/thumbnails
   - **order-queue**: Auto-cancel unpaid orders, cart abandonment
   - **analytics-queue**: Product views, search ranking, seller stats

3. **Job Processors:**
   - Email welcome/verification/password reset/order confirmation
   - Image optimization and S3 upload
   - Order timeout processing
   - Analytics aggregation

### Phase 8: Caching (Week 12)
🔄 **To Implement:**
1. **Redis Caching Layer:**
   - Product detail caching (`product:{id}`)
   - Product listing/search caching (`products:list:{hash}`)
   - Category tree caching (`categories:tree`)
   - User session data (`session:{userId}`)
   - Rate limiting (`ratelimit:{ip}:{endpoint}`)
   - Seller stats caching (`seller:{id}:stats`)

2. **Cache-Aside Pattern Implementation:**
   - Check Redis first
   - Fallback to PostgreSQL on miss
   - Update/delete cache on data mutation
   - Proper TTL values for each use case

3. **Cache Invalidation Strategies:**
   - Product update/delete → clear product cache
   - Any product change → clear listing/search caches
   - Category change → clear category tree cache
   - Logout/token refresh → clear session data

### Phase 9: Testing (Weeks 13-14)
🔄 **To Implement:**
1. **Unit Tests:**
   - Services and utility functions (90%+ coverage)
   - Mock all external dependencies
   - Test edge cases and error conditions

2. **Integration Tests:**
   - Full request → DB flow per endpoint (80%+ coverage)
   - Use test database
   - Test authentication flows, validation, error handling

3. **Specific Test Suites:**
   - Auth tests (JWT, MFA, token refresh, role enforcement) - 100%
   - Payment tests (webhook handling, payment intent lifecycle) - 100%
   - Load tests with k6 or Artillery (500+ concurrent users)

### Phase 10: Hardening (Weeks 15-16)
🔄 **To Implement:**
1. **Security Audit:**
   - Penetration testing preparation
   - Dependency vulnerability scanning
   - Security headers validation

2. **Performance Profiling:**
   - Database query optimization (EXPLAIN ANALYZE)
   - N+1 query elimination
   - Redis hit rate monitoring
   - Response time optimization

3. **Logging & Monitoring:**
   - Structured JSON logging with Winston
   - Request ID tracing
   - Error tracking with Sentry
   - Uptime monitoring setup
   - Health check enhancements

### Phase 11: Deploy (Weeks 17-18)
🔄 **To Implement:**
1. **Production Deployment:**
   - Docker production build optimization
   - CI/CD pipeline completion (GitHub Actions)
   - Staging environment deployment
   - Production deployment with zero-downtime

2. **Final Checks:**
   - Environment variables validation
   - SSL/TLS configuration
   - Backup and disaster recovery procedures
   - Documentation completion

## Detailed Technical Implementation Guidelines

### Coding Standards:
1. Follow existing code patterns in auth and users modules
2. Use TypeScript strict mode
3. Implement proper error handling with custom AppError
4. Use Zod for input validation on all endpoints
5. Implement comprehensive JSDoc comments
6. Follow REST API design principles
7. Use async/await consistently
8. Implement proper logging with request IDs

### Module Structure Template:
For each new module (products, orders, reviews, admin, payments):
```
src/modules/[module-name]/
├── controller/
│   └── [module-name].controller.ts
├── service/
│   └── [module-name].service.ts
├── repository/
│   └── [module-name].repository.ts
├── routes/
│   └── routes.ts
├── schema/
│   └── [module-name].schema.ts
├── types/
│   └── [module-name].types.ts
└── index.ts (optional barrel export)
```

### Key Implementation Notes:

#### Product Service Considerations:
- Use Prisma transactions for operations affecting multiple tables
- Implement proper stock management (reservation vs. deduction)
- Handle product status transitions correctly
- Generate unique slugs with collision handling
- Implement efficient search with full-text capabilities

#### Order Service Considerations:
- Use database transactions for order creation and payment processing
- Implement idempotency keys for payment processing
- Handle webhook signature verification
- Implement proper error handling for payment failures
- Consider eventual consistency for order status updates

#### Security Considerations:
- Validate ownership on all resource modification endpoints
- Implement rate limiting on public endpoints
- Sanitize user-generated content (reviews, product descriptions)
- Use helmet.js and CSP headers
- Implement proper CORS policies
- Encrypt sensitive data at rest where applicable

#### Performance Considerations:
- Implement database indexing as specified in project plan
- Use pagination on all list endpoints (max 50 items/page)
- Implement caching layer as described
- Use connection pooling (Prisma handles this)
- Implement compression middleware
- Optimize image delivery (consider CDN integration)

## Risk Mitigation

### Technical Risks:
1. **Payment Processing Complexity** - Mitigate by using Stripe SDK thoroughly tested in sandbox
2. **Image Processing Overhead** - Mitigate by offloading to BullMQ workers
3. **Database Performance at Scale** - Mitigate by proper indexing and caching strategies
4. **Concurrency Issues** - Mitigate by using database transactions and optimistic locking where needed

### Schedule Risks:
1. **Underestimation of Complexity** - Mitigate by following phased approach with clear deliverables
2. **Dependency Delays** - Mitigate by using well-established libraries (Prisma, Redis, BullMQ)
3. **Integration Challenges** - Mitigate by implementing contract-first development with thorough testing

## Success Criteria

### Functional Completeness:
- All API endpoints from project plan implemented and tested
- Authentication and authorization working correctly
- Data validation and sanitization in place
- Error handling consistent across all endpoints
- File upload and processing working
- Email notifications functional
- Background jobs processing correctly

### Quality Standards:
- Test coverage meeting targets (90% unit, 80% integration)
- No critical security vulnerabilities
- API response times under 200ms for cached requests
- Proper error responses with meaningful messages
- Comprehensive API documentation via Swagger
- Clean code following established patterns

### Operational Readiness:
- Docker builds successfully in all environments
- Database migrations run automatically
- Health checks monitoring all dependencies
- Logging structured and searchable
- Environment variables properly managed
- Graceful degradation when non-critical services fail

## Next Immediate Actions

1. **Create Products Module** (Start immediately)
   - Set up module directory structure
   - Implement product repository with Prisma queries
   - Create product service with business logic
   - Build product controller with validation
   - Define routes and API endpoints
   - Add Zod schemas for validation
   - Implement product image upload functionality

2. **Parallel Development Approach:**
   - Once products module foundation is laid, can begin orders module
   - Reviews module can follow products (depends on product data)
   - Admin module can be developed alongside orders/reviews
   - Payments module integrates with orders

This implementation plan provides a clear roadmap to complete the marketplace platform API following the established architecture and timeline. Each phase builds upon the previous one, ensuring a solid foundation for subsequent features.