export default async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');

  try {
    const environment = global.__TESTCONTAINERS_ENVIRONMENT__;

    if (environment) {
      console.log('⏬ Stopping Docker Compose environment...');
      await environment.down();
      console.log('✅ Docker Compose environment stopped');
    } else {
      console.log('⚠️ No environment found to tear down');
    }

    console.log('✅ Global test teardown completed');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw here to avoid masking test failures
  }
}
