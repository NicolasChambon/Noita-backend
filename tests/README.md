# Integration Test Infrastructure

This directory contains a shared test infrastructure for integration tests that use Docker containers.

## Architecture

### Global Setup & Teardown
- **`globalSetup.ts`**: Starts Docker Compose environment once for all tests
- **`globalTeardown.ts`**: Stops Docker Compose environment after all tests complete
- **`jest.config.js`**: Configured to run tests sequentially (`maxWorkers: 1`) to avoid database conflicts

### Shared Helpers
- **`helpers/testDatabase.ts`**: Provides shared database connection and seeding utilities
  - `getTestDatabase()`: Returns configured Sequelize instance
  - `seedTestData()`: Seeds consistent test data across all tests
  - `closeTestDatabase()`: Cleanup function

### Test Structure
```
src/__tests__/
├── globalSetup.ts          # 🚀 Start containers once
├── globalTeardown.ts       # 🧹 Stop containers after all tests
├── setup.ts               # 📋 Environment variables & basic setup
├── helpers/
│   └── testDatabase.ts    # 🗄️ Shared database utilities
└── controllers/
    ├── postController.test.ts     # 📝 Post API tests
    └── concertController.test.ts  # 🎵 Concert API tests
```

## Benefits

### 🚀 **Performance**
- Docker containers start **once** instead of per test file
- Tests run faster with shared infrastructure
- Sequential execution prevents database conflicts

### 🔄 **Consistency** 
- All tests use the same database schema and seeding
- Predictable test data across all controller tests
- Isolated test runs with clean state

### 🛠️ **Maintainability**
- Centralized test configuration
- Easy to add new controller tests
- Shared utilities reduce code duplication

### 📊 **Reliability**
- No port conflicts between test suites
- Proper cleanup after test completion
- Better error handling and logging

## Usage

### Running Tests
```bash
# Run all integration tests
npm test

# Run specific controller tests
npm test -- --testPathPattern=postController.test.ts
npm test -- --testPathPattern=concertController.test.ts

# Run multiple controller tests
npm test -- --testPathPattern="(post|concert)Controller.test.ts"
```

### Adding New Controller Tests
1. Create new test file in `controllers/` directory
2. Import shared utilities:
   ```typescript
   import { getTestDatabase, seedTestData } from '../helpers/testDatabase.js';
   ```
3. Use shared database in `beforeAll()` and `beforeEach()` hooks
4. No need to manage Docker containers - they're handled globally

### Environment Variables
The global setup automatically configures:
- `TEST_DB_HOST`: Database container host
- `TEST_DB_PORT`: Database container port
- `TEST_DB_NAME`: Database name (noita)
- `TEST_DB_USER`: Database user (postgres)
- `TEST_DB_PASS`: Database password (postgres)

## Example Test Structure
```typescript
describe('MyController Integration Tests', () => {
    let sequelize: Sequelize;
    let app: express.Application;

    beforeAll(async () => {
        // Get shared database connection
        sequelize = getTestDatabase();
        await sequelize.authenticate();
        
        // Set up test app
        app = express();
        // ... configure routes
    });

    beforeEach(async () => {
        // Reseed with consistent test data
        await seedTestData(sequelize);
    });

    // ... your tests
});
``` 