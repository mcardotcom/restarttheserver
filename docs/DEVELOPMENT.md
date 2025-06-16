# Development Guide

## Project Overview

This is a Next.js application that serves as a news aggregation and management platform. It includes features for article management, sponsor card management, and an admin panel.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Testing**: Jest, Playwright
- **API Validation**: Zod
- **Logging**: Custom Logger

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

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── admin/          # Admin panel pages
│   └── (public)/       # Public pages
├── components/         # React components
├── lib/               # Utility functions
├── types/             # TypeScript types
└── styles/            # Global styles
```

## Development Workflow

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for code formatting
- Write tests for new features

### Testing

1. Unit Tests:
   ```bash
   npm test
   ```

2. E2E Tests:
   ```bash
   npm run test:e2e
   ```

3. Test Coverage:
   ```bash
   npm run test:coverage
   ```

### API Development

1. All API routes are in `src/app/api/`
2. Use Zod for request validation
3. Implement rate limiting for public endpoints
4. Handle errors consistently using the error handling utility

### Database

1. Use Supabase for data storage
2. Follow the schema defined in `supabase/migrations/`
3. Use TypeScript types for database models

### Authentication

1. Use Supabase Auth for authentication
2. Protect admin routes with middleware
3. Implement proper session management

## Security

### Rate Limiting

- Public API endpoints are rate-limited
- Admin endpoints have stricter rate limits
- Rate limits are configurable via environment variables

### Input Validation

- All API routes use Zod for request validation
- Client-side validation is implemented for forms
- Sanitize user input before database operations

### Error Handling

- Use the error handling utility for consistent error responses
- Implement proper error boundaries in React components
- Log errors appropriately

### Security Headers

- Security headers are configured in `vercel.json`
- CSP is configured in `src/middleware.ts`
- HTTPS is enforced in production

## Deployment

1. Push to main branch
2. Vercel automatically deploys
3. Run tests in CI/CD pipeline
4. Monitor for errors

## Monitoring

1. Use the logging utility for consistent logging
2. Monitor error rates and performance
3. Set up alerts for critical issues

## Contributing

1. Create a feature branch
2. Write tests
3. Submit a pull request
4. Get code review
5. Merge after approval

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check Supabase credentials
   - Verify network connectivity
   - Check for rate limiting

2. **Authentication Problems**
   - Clear browser cookies
   - Check session expiration
   - Verify environment variables

3. **API Errors**
   - Check request validation
   - Verify rate limits
   - Check error logs

### Getting Help

- Check the documentation
- Review error logs
- Contact the development team

## Best Practices

1. **Code Quality**
   - Write clean, maintainable code
   - Use TypeScript types
   - Follow SOLID principles

2. **Testing**
   - Write unit tests
   - Add integration tests
   - Test edge cases

3. **Security**
   - Validate all input
   - Implement proper authentication
   - Follow security best practices

4. **Performance**
   - Optimize database queries
   - Use proper caching
   - Monitor performance metrics

## Content Types and Media Handling

### YouTube Videos

1. **Processing**
   - Videos are processed through both manual and automated routes
   - Transcripts are fetched and analyzed using GPT-4
   - Videos are categorized with `category: 'video'` and `media_type: 'video'`

2. **Database Fields**
   - `media_type`: Specifies the content type (e.g., 'video', 'article')
   - `category`: Content category (e.g., 'video', 'Promotion')
   - `metadata`: Contains additional media-specific data
     - For videos: transcript excerpt and media type

3. **Manual Processing**
   - Use the admin panel's YouTube processor
   - Provide video URL, title, and transcript
   - System automatically sets appropriate media type and category

4. **Automated Processing**
   - Cron job fetches new videos
   - Processes transcripts and generates summaries
   - Sets proper categorization automatically 