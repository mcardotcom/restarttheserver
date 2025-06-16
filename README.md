# Restart The Server

A modern news aggregation and management platform built with Next.js, TypeScript, and Supabase.

## Features

- News headline aggregation and management
- Admin panel for content moderation
- Authentication and authorization
- Real-time updates
- Responsive design
- Comprehensive testing infrastructure

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Testing**: Jest, Playwright, React Testing Library

## Testing Infrastructure

The project includes a comprehensive testing setup:

### Unit Tests

- Jest for unit testing
- React Testing Library for component testing
- Mock implementations for external services

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Integration Tests

- API route testing with Jest
- Mock HTTP requests with node-mocks-http
- Database integration tests

### E2E Tests

- Playwright for end-to-end testing
- Cross-browser testing support
- Visual regression testing

Run E2E tests:
```bash
npm run test:e2e
```

Run E2E tests with UI:
```bash
npm run test:e2e:ui
```

Debug E2E tests:
```bash
npm run test:e2e:debug
```

### CI/CD Integration

Run all tests in CI environment:
```bash
npm run test:ci
```

## TypeScript Support

The project uses TypeScript for type safety and better developer experience:

- Strict type checking enabled
- Comprehensive type definitions
- Interface definitions for all components and API responses
- Type-safe API calls

## Logging and Error Tracking

- Custom logging utility with different log levels
- Error tracking integration ready
- Development and production logging strategies
- Error boundary implementation

## Caching Strategy

- In-memory caching for frequently accessed data
- TTL-based cache invalidation
- Cache size management
- Memoization utility for expensive computations

## Performance Optimizations

- Component optimization
- Proper caching strategies
- Error boundaries
- Lazy loading
- Image optimization

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- Run linter:
  ```bash
  npm run lint
  ```
- Run tests:
  ```bash
  npm test
  ```
- Build for production:
  ```bash
  npm run build
  ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.