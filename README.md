# Noïta Backend API

A Node.js API built with TypeScript, Express, and PostgreSQL, optimized for Google Cloud Run deployment.


## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- Firebase project (for authentication)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Noita-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   # Database
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_NAME=your_db_name
   
   # Server
   SERVER_PORT=3000
   NODE_ENV=development
   
   # CORS
   CORS_ORIGINS=http://localhost:5173,https://noita.ch
   
   # Firebase (set up service account)
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Development with TypeScript
```bash
npm run start:dev
```

## 🧪 Testing

The project includes a comprehensive test suite using Jest with TypeScript support:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest src/__tests__/simple.test.ts

# Type checking
npm run type-check
```

### Test Structure

- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test API endpoints and database interactions  
- **Validation Tests**: Test input validation and sanitization
- **Configuration Tests**: Test environment and configuration handling

### Test Coverage

The test suite covers:
- ✅ Basic functionality and TypeScript features
- ✅ Environment variable validation
- ✅ Configuration management
- ✅ Input validation and sanitization
- ✅ Error handling
- ✅ Async operations

### Mocking Strategy

Tests use comprehensive mocking for:
- Database operations (Sequelize)
- File system operations
- Firebase authentication
- External dependencies

## 📝 Code Quality

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
```

## 🏗️ Architecture

### Directory Structure
```
src/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/          # Database models
├── routers/         # Route definitions
├── services/        # Business logic layer
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
    ├── errors/      # Error handling
    └── validation/  # Input validation
```

### Key Improvements

#### 1. **Type Safety**
- Comprehensive TypeScript types for all data structures
- Type-safe request/response handling
- Compile-time error detection

#### 2. **Service Layer Pattern**
- Business logic separated from controllers
- Proper transaction management
- Reusable service methods

#### 3. **Error Handling**
- Custom error classes with proper HTTP status codes
- Centralized error handling middleware
- Structured error responses

#### 4. **Performance Optimizations**
- Lazy loading for Cloud Run cold starts
- Connection pooling with optimized settings
- Graceful shutdown handling
- Health check endpoint

#### 5. **Security**
- Type-safe authentication middleware
- Input validation and sanitization
- Proper error message handling

## 🚀 Deployment

### Google Cloud Run

1. **Build Docker image**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY dist/ ./dist/
   COPY public/ ./public/
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy noita-backend \
     --source . \
     --platform managed \
     --region europe-west1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production
   ```

### Environment Variables for Production
```env
NODE_ENV=production
DB_USER=production_user
DB_PASS=production_password
DB_HOST=production_host
DB_NAME=production_db
CORS_ORIGINS=https://noita.ch
```

## 📊 Performance Metrics

### Cold Start Optimization
- **Lazy Loading**: Database and routes loaded on first request
- **Health Check**: Immediate response without initialization
- **Connection Pooling**: Optimized for Cloud Run constraints
- **Graceful Shutdown**: Proper cleanup on container termination

## 🔧 API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/:id` - Update post (authenticated)
- `DELETE /api/posts/:id` - Delete post (authenticated)

### Health Check
- `GET /health` - Application health status

## 🔍 Monitoring

### Health Check
The application provides a comprehensive health check endpoint at `/health` that returns:
- Application status
- Uptime
- Timestamp
- Database connection status (when initialized)

