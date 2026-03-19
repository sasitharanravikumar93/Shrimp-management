# Backend Features and Usage Guide

This document provides comprehensive information about all the backend features, improvements, and capabilities implemented in the Shrimp Farm Management System.

## 🔐 Authentication & Authorization System

### Overview
Complete JWT-based authentication system with role-based access control (RBAC).

### Features
- **User Registration & Login**: Secure user account creation and authentication
- **Role-Based Access Control**: Four user roles with different permissions
  - `admin`: Full system access, user management
  - `manager`: Farm management, data entry, reporting
  - `operator`: Data entry, basic operations
  - `viewer`: Read-only access to data and reports
- **JWT Token Management**: Secure token generation and validation
- **Account Security**: Login attempt tracking, account locking, password policies
- **Password Management**: Secure hashing, password reset functionality

### API Endpoints

#### Authentication
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
PUT /api/auth/profile
PUT /api/auth/change-password
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### User Management (Admin Only)
```http
GET /api/auth/users
POST /api/auth/users
PUT /api/auth/users/:id
DELETE /api/auth/users/:id
```

### Usage Examples

#### User Registration
```javascript
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "operator",
  "language": "en"
}
```

#### User Login
```javascript
POST /api/auth/login
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}

// Response includes JWT token
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Protected Requests
```javascript
// Include JWT token in Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ Security Enhancements

### Overview
Comprehensive security system protecting against common web vulnerabilities.

### Features
- **Rate Limiting**: Prevents DoS attacks with configurable limits
- **Input Sanitization**: Protects against injection attacks
- **CORS Protection**: Secure cross-origin resource sharing
- **IP Blocking**: Automatic threat detection and blocking
- **Security Event Logging**: Comprehensive security audit trails
- **Advanced Threat Detection**: Pattern-based suspicious activity detection

### Security Configuration

#### Rate Limiting
- **Default**: 100 requests per 15 minutes per IP
- **Configurable**: Via environment variables
- **Endpoints**: Separate limits for auth vs general endpoints

#### Input Sanitization
- **HTML/Script Tags**: Automatically removed from all inputs
- **SQL Injection**: Mongoose protects against NoSQL injection
- **XSS Protection**: Content sanitization on all user inputs

#### CORS Configuration
```javascript
// Production CORS settings
{
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### Security Monitoring

#### Security Status Endpoint
```http
GET /api/security/status
```
Returns current security metrics including blocked IPs, failed attempts, and threat statistics.

#### IP Management
```http
POST /api/security/unblock-ip
{
  "ip": "192.168.1.100"
}
```

---

## ✅ Input Validation & Error Handling

### Overview
Comprehensive input validation and standardized error responses across all endpoints.

### Features
- **Express-Validator Integration**: Robust server-side validation
- **Custom Validation Rules**: Business-specific validation logic
- **Standardized Error Responses**: Consistent error format across API
- **Request ID Tracking**: Unique identifiers for debugging
- **Comprehensive Error Types**: Custom error classes for different scenarios

### Validation Examples

#### Pond Creation Validation
```javascript
POST /api/ponds
{
  "name": {
    "en": "Pond A",
    "ta": "குளம் ஏ"
  },
  "size": 1000,        // Required, positive number
  "capacity": 50000,   // Required, positive number
  "seasonId": "60f1...", // Required, valid ObjectId
  "status": "active"   // Optional, enum validation
}
```

#### Validation Error Response
```javascript
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "size",
      "message": "Size must be a positive number",
      "value": -100
    }
  ],
  "requestId": "req_1234567890_abc123"
}
```

### Error Types
- **ValidationError** (400): Input validation failures
- **NotFoundError** (404): Resource not found
- **UnauthorizedError** (401): Authentication required
- **ForbiddenError** (403): Insufficient permissions
- **ConflictError** (409): Duplicate resource conflicts
- **DatabaseError** (500): Database operation failures

---

## 📊 Database Optimization & Models

### Overview
Enhanced database models with comprehensive validation, indexing, and performance optimization.

### Features
- **Comprehensive Schema Validation**: Business rule enforcement at database level
- **Compound Indexes**: Optimized queries for common access patterns
- **Multilingual Support**: Built-in internationalization for text fields
- **Audit Trails**: Automatic timestamping and change tracking
- **Referential Integrity**: Proper relationships and cascade operations

### Enhanced Models

#### Pond Model
```javascript
{
  name: Map<String, String>,     // Multilingual names
  size: Number,                  // Square meters, validated range
  capacity: Number,              // Liters, validated range
  seasonId: ObjectId,           // Reference to Season
  status: String,               // Enum: active, inactive, maintenance
  location: {                   // Geospatial data
    latitude: Number,
    longitude: Number
  },
  timestamps: true              // createdAt, updatedAt
}

// Indexes
- { seasonId: 1, status: 1 }
- { location: "2dsphere" }
- { "name.en": "text", "name.ta": "text" }
```

#### Season Model
```javascript
{
  name: Map<String, String>,     // Multilingual names
  startDate: Date,              // Validated date ranges
  endDate: Date,                // Must be after startDate
  status: String,               // Enum: planning, active, completed
  weather: {                    // Weather conditions
    temperature: Number,
    humidity: Number,
    rainfall: Number
  },
  timestamps: true
}

// Indexes
- { startDate: 1, endDate: 1 }
- { status: 1 }
```

#### Enhanced Feed Input Model
```javascript
{
  date: Date,                   // Validated, not future
  time: String,                 // HH:MM format
  pondId: ObjectId,            // Reference to Pond
  inventoryItemId: ObjectId,   // Reference to InventoryItem
  quantity: Number,            // Positive number
  seasonId: ObjectId,          // Reference to Season
  batchNumber: String,         // Feed batch tracking
  costPerUnit: Number,         // Cost tracking
  timestamps: true
}

// Indexes
- { pondId: 1, date: 1 }
- { seasonId: 1, date: 1 }
- { inventoryItemId: 1 }
```

### Database Utilities
Reusable functions for common database operations:

```javascript
// Pagination utility
const getPaginatedResults = async (Model, options) => {
  const { filter, page, limit, populate, sort } = options;
  // Returns paginated results with metadata
};

// Entity validation
const validateEntityExists = async (Model, id, entityName) => {
  // Validates ObjectId and entity existence
};
```

---

## 🚀 API Endpoints & Features

### Overview
Complete API implementation with all missing endpoints, consistent patterns, and advanced features.

### Core Endpoints

#### Pond Management
```http
GET    /api/ponds                    # List all ponds (paginated)
POST   /api/ponds                    # Create new pond
GET    /api/ponds/:id                # Get pond details
PUT    /api/ponds/:id                # Update pond
DELETE /api/ponds/:id                # Delete pond
GET    /api/ponds/season/:seasonId   # Get ponds by season
GET    /api/ponds/:id/kpis           # Get pond KPIs
GET    /api/ponds/:id/events         # Get pond events
GET    /api/ponds/:id/full-cycle     # Get complete pond data
```

#### Season Management
```http
GET    /api/seasons                  # List all seasons
POST   /api/seasons                  # Create new season
GET    /api/seasons/:id              # Get season details
PUT    /api/seasons/:id              # Update season
DELETE /api/seasons/:id              # Delete season
```

#### Feed Management
```http
GET    /api/feed-inputs              # List feed inputs (paginated)
POST   /api/feed-inputs              # Create feed input
POST   /api/feed-inputs/batch        # Batch create feed inputs
GET    /api/feed-inputs/:id          # Get feed input details
PUT    /api/feed-inputs/:id          # Update feed input
DELETE /api/feed-inputs/:id          # Delete feed input
GET    /api/feed-inputs/pond/:pondId # Get by pond
GET    /api/feed-inputs/season/:seasonId # Get by season
GET    /api/feed-inputs/filtered     # Advanced filtering
```

#### Water Quality Management
```http
GET    /api/water-quality-inputs     # List water quality data
POST   /api/water-quality-inputs     # Create water quality record
POST   /api/water-quality-inputs/batch # Batch create records
GET    /api/water-quality-inputs/:id # Get record details
PUT    /api/water-quality-inputs/:id # Update record
DELETE /api/water-quality-inputs/:id # Delete record
GET    /api/water-quality-inputs/filtered # Advanced filtering
```

#### Farm Analytics
```http
GET    /api/farm/kpis               # Farm-level KPIs
GET    /api/farm/trends/water-quality # Water quality trends
GET    /api/farm/trends/feed-consumption # Feed consumption trends
GET    /api/farm/report             # Comprehensive farm report
```

### Advanced Features

#### Pagination
All list endpoints support consistent pagination:
```javascript
GET /api/ponds?page=1&limit=25

// Response format
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "pages": 6
  }
}
```

#### Filtering
Advanced filtering with multiple criteria:
```javascript
GET /api/feed-inputs/filtered?startDate=2024-01-01&endDate=2024-01-31&pondId=60f1...&minQuantity=10
```

#### Multilingual Support
Automatic language detection and translation:
```javascript
// Request headers
Accept-Language: ta,en;q=0.9

// Response with Tamil translations
{
  "name": "குளம் ஏ",  // Translated from multilingual field
  ...
}
```

---

## 📈 Monitoring & Observability

### Overview
Comprehensive monitoring system with health checks, metrics collection, and structured logging.

### Health Monitoring

#### Health Check Endpoints
```http
GET /api/health                  # Basic health status
GET /api/health/detailed         # Comprehensive health report
GET /api/health/ready           # Kubernetes readiness probe
GET /api/health/live            # Kubernetes liveness probe
GET /api/health/database        # Database health
GET /api/health/memory          # Memory usage
GET /api/health/cpu             # CPU usage
GET /api/health/uptime          # Application uptime
GET /api/health/environment     # Environment configuration
```

#### Health Check Response Example
```javascript
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "connected",
      "isHealthy": true,
      "collections": 8,
      "dataSize": 156
    },
    "memory": {
      "process": {
        "heapUsed": 45,
        "heapTotal": 89,
        "heapUsagePercent": 51
      },
      "isHealthy": true
    },
    "cpu": {
      "cores": 4,
      "loadAverage": {
        "1min": 0.23,
        "5min": 0.18,
        "15min": 0.15
      },
      "isHealthy": true
    }
  },
  "summary": {
    "healthy": 6,
    "total": 6,
    "percentage": 100
  }
}
```

### Metrics Collection

#### Metrics Endpoints
```http
GET /api/metrics                 # Summary metrics
GET /api/metrics/detailed        # Complete metrics
GET /api/metrics/http            # HTTP request metrics
GET /api/metrics/database        # Database performance
GET /api/metrics/auth            # Authentication metrics
GET /api/metrics/business        # Business operation metrics
GET /api/metrics/prometheus      # Prometheus format
POST /api/metrics/reset          # Reset metrics (admin only)
```

#### Collected Metrics
- **HTTP Metrics**: Request counts, response times, status codes
- **Database Metrics**: Query counts, execution times, connection pool
- **Authentication Metrics**: Login attempts, success/failure rates
- **Business Metrics**: Operations count (ponds created, feeds added, etc.)
- **Performance Metrics**: Memory usage, CPU load, error rates

#### Prometheus Integration
```http
GET /api/metrics/prometheus

# Response in Prometheus format
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total 1234

# HELP response_time_seconds Request response time
# TYPE response_time_seconds histogram
response_time_seconds_bucket{le="0.1"} 850
response_time_seconds_bucket{le="0.5"} 1200
```

### Structured Logging

#### Log Categories
- **HTTP Logs**: Request/response logging with performance metrics
- **Security Logs**: Authentication events, failed attempts, blocked IPs
- **Audit Logs**: Business operations, data changes, user actions
- **Error Logs**: Application errors with stack traces and context
- **Performance Logs**: Slow queries, high memory usage alerts

#### Log Files
```
logs/
├── combined.log      # All log levels
├── error.log         # Errors only
├── access.log        # HTTP requests
├── security.log      # Security events
├── audit.log         # Business operations
├── exceptions.log    # Unhandled exceptions
└── rejections.log    # Promise rejections
```

#### Log Format Example
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "User action: pond_created",
  "service": "shrimp-farm-api",
  "requestId": "req_1234567890_abc123",
  "userId": "60f1a2b3c4d5e6f7a8b9c0d1",
  "category": "business",
  "action": "pond_created",
  "pondId": "60f1a2b3c4d5e6f7a8b9c0d2",
  "pondName": "Pond A",
  "seasonId": "60f1a2b3c4d5e6f7a8b9c0d3"
}
```

---

## 🧪 Testing Infrastructure

### Overview
Comprehensive testing system with integration tests, realistic test data, and high coverage.

### Testing Features
- **Integration Testing**: Real database operations with in-memory MongoDB
- **Test Data Factory**: Realistic, consistent test data generation
- **Comprehensive Coverage**: Unit, integration, and edge case testing
- **Test Utilities**: Common setup, teardown, and assertion helpers
- **Performance Testing**: Response time and load testing capabilities

### Test Categories

#### Unit Tests
```javascript
// Example: Model validation testing
describe('Pond Model Validation', () => {
  test('should validate required fields', async () => {
    const pondData = { /* missing required fields */ };
    const pond = new Pond(pondData);
    await expect(pond.save()).rejects.toThrow();
  });
});
```

#### Integration Tests
```javascript
// Example: API endpoint testing
describe('Pond Controller Integration', () => {
  test('should create pond with valid data', async () => {
    const response = await request(app)
      .post('/api/ponds')
      .set('Authorization', `Bearer ${token}`)
      .send(validPondData)
      .expect(201);
    
    expect(response.body.data).toHaveProperty('_id');
  });
});
```

### Test Data Factory
```javascript
// Generate realistic test data
const testDataFactory = {
  createUser: (overrides = {}) => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: 'TestPassword123!',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    role: 'operator',
    ...overrides
  }),

  createPond: (seasonId, overrides = {}) => ({
    name: { en: faker.word.words(2) },
    size: faker.number.int({ min: 100, max: 5000 }),
    capacity: faker.number.int({ min: 1000, max: 100000 }),
    seasonId,
    status: 'active',
    ...overrides
  })
};
```

### Test Scripts
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🔧 Development Tools & Configuration

### ESLint Configuration
Comprehensive code quality enforcement:

```javascript
// .eslintrc.json
{
  "env": {
    "node": true,
    "es2021": true,
    "jest": true
  },
  "extends": ["eslint:recommended"],
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "require-jsdoc": ["error", {
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true
      }
    }]
  }
}
```

### NPM Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --detectOpenHandles --forceExit",
    "test:unit": "jest --detectOpenHandles --forceExit --testPathPattern=unit",
    "test:integration": "jest --detectOpenHandles --forceExit --testPathPattern=integration",
    "test:watch": "jest --watch --detectOpenHandles",
    "test:coverage": "jest --coverage --detectOpenHandles --forceExit",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "lint:check": "eslint . --ext .js --max-warnings 0",
    "format": "npm run lint:fix",
    "seed": "node seed.js",
    "docs": "jsdoc -c jsdoc.config.json",
    "validate": "npm run lint:check && npm run test",
    "precommit": "npm run validate"
  }
}
```

### Environment Configuration
```bash
# .env.example
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/shrimpfarm
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Deployment & Production

### Production Readiness Features
- **Environment-based Configuration**: Separate configs for dev/staging/production
- **Health Monitoring**: Kubernetes-compatible health checks
- **Metrics Collection**: Prometheus integration for monitoring
- **Security Hardening**: Production-ready security configuration
- **Error Handling**: Comprehensive error tracking and reporting
- **Logging**: Structured logging with log rotation
- **Performance Optimization**: Database indexing and query optimization

### Docker Support
```dockerfile
# Dockerfile example
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

### Kubernetes Health Checks
```yaml
# Kubernetes deployment example
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 5001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 5001
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 📚 API Documentation

### Authentication Required
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access
- **Public**: Health checks, authentication endpoints
- **Authenticated**: Basic CRUD operations
- **Manager+**: Advanced analytics, bulk operations
- **Admin**: User management, system configuration

### Response Format
All API responses follow a consistent format:

#### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "requestId": "req_1234567890_abc123"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message",
      "value": "invalid_value"
    }
  ],
  "requestId": "req_1234567890_abc123"
}
```

### Rate Limiting
API endpoints are rate-limited to prevent abuse:
- **General**: 100 requests per 15 minutes
- **Authentication**: 5 login attempts per 15 minutes
- **Admin operations**: 50 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

---

## 🔍 Troubleshooting

### Common Issues

#### Authentication Errors
```javascript
// 401 Unauthorized
{
  "success": false,
  "message": "Authentication required"
}

// Solution: Include valid JWT token in Authorization header
```

#### Validation Errors
```javascript
// 400 Bad Request
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}

// Solution: Check required fields and data types
```

#### Rate Limiting
```javascript
// 429 Too Many Requests
{
  "success": false,
  "message": "Rate limit exceeded"
}

// Solution: Wait for rate limit reset or use exponential backoff
```

### Debug Tools

#### Health Status
Check application health:
```bash
curl http://localhost:5001/api/health/detailed
```

#### Metrics
Monitor application metrics:
```bash
curl http://localhost:5001/api/metrics
```

#### Logs
Check application logs:
```bash
tail -f logs/combined.log
tail -f logs/error.log
```

---

## 📈 Performance Optimization

### Database Optimization
- **Indexes**: Compound indexes for common query patterns
- **Aggregation**: Efficient data aggregation pipelines
- **Connection Pooling**: Optimized MongoDB connection management
- **Query Optimization**: Analyzed and optimized slow queries

### Caching Strategy
- **Response Caching**: Cache frequently accessed data
- **Database Query Caching**: Reduce database load
- **Cache Invalidation**: Smart cache clearing on data updates

### Memory Management
- **Memory Monitoring**: Automatic memory usage tracking
- **Garbage Collection**: Optimized GC settings
- **Memory Leak Detection**: Monitoring and alerting

### Performance Monitoring
- **Response Time Tracking**: Monitor API performance
- **Database Performance**: Track query execution times
- **Resource Usage**: Monitor CPU and memory usage
- **Alert Thresholds**: Automatic alerts for performance issues

---

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks
1. **Database Maintenance**: Index optimization, data cleanup
2. **Log Rotation**: Manage log file sizes and retention
3. **Security Updates**: Regular dependency updates
4. **Performance Review**: Monitor and optimize slow operations
5. **Backup Verification**: Ensure backup integrity

### Update Procedures
1. **Pre-update Testing**: Run full test suite
2. **Database Migrations**: Apply schema changes safely
3. **Configuration Updates**: Update environment variables
4. **Health Verification**: Confirm system health post-update
5. **Rollback Plan**: Prepare rollback procedures

---

This comprehensive backend system provides a robust, secure, and scalable foundation for the Shrimp Farm Management System. All features are production-ready with comprehensive monitoring, testing, and documentation.