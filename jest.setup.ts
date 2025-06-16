import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.CRON_SECRET = 'test-cron-secret';
process.env.RATE_LIMIT_INTERVAL = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '60';
process.env.CRON_RATE_LIMIT_INTERVAL = '300000';
process.env.CRON_RATE_LIMIT_MAX_REQUESTS = '10';

// Mock console.error to keep test output clean
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 