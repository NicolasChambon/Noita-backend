import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';
import path from 'path';

declare global {
  var __TESTCONTAINERS_ENVIRONMENT__:
    | StartedDockerComposeEnvironment
    | undefined;
}

export default async function globalSetup() {
  console.log('🚀 Starting global test setup...');

  try {
    // Start Docker Compose environment
    const composeFilePath = path.resolve(process.cwd());
    console.log('📁 Compose file path:', composeFilePath);

    const environment = await new DockerComposeEnvironment(
      composeFilePath,
      'compose.yml'
    )
      .withWaitStrategy('db-1', Wait.forHealthCheck())
      .up(['db']);

    // Get the PostgreSQL container details
    const dbContainer = environment.getContainer('db-1');
    const host = dbContainer.getHost();
    const port = dbContainer.getMappedPort(5432);

    console.log(`📊 Database container started on ${host}:${port}`);

    // Store environment globally
    global.__TESTCONTAINERS_ENVIRONMENT__ = environment;

    // Set environment variables for tests
    process.env.TEST_DB_HOST = host;
    process.env.TEST_DB_PORT = port.toString();
    process.env.TEST_DB_NAME = 'noita';
    process.env.TEST_DB_USER = 'postgres';
    process.env.TEST_DB_PASS = 'postgres';

    // Set production environment variables for tests that import main config
    process.env.DB_HOST = host;
    process.env.DB_PORT = port.toString();
    process.env.DB_NAME = 'noita';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASS = 'postgres';

    console.log('✅ Global test setup completed');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
}
