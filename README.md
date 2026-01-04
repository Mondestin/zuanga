# Zuanga API

Production-ready enterprise Express.js API server built with TypeScript.

## Features

- ✅ TypeScript for type safety
- ✅ Express.js with best practices
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Production-ready error handling with error codes
- ✅ Structured logging with Winston (JSON in production)
- ✅ Request ID tracking for distributed tracing
- ✅ Environment configuration
- ✅ ESLint & Prettier
- ✅ Health check endpoint
- ✅ Graceful shutdown

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

### Development

Run the development server with hot reload:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production Build

Build the TypeScript code:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

### Health Check

```
GET /api/v1/health
```

Returns server health status, uptime, and environment information.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123.456,
    "environment": "development",
    "version": "1.0.0"
  }
}
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Type check without emitting files

## Project Structure

```
.
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   │   └── v1/          # Version 1 routes
│   ├── utils/           # Utility functions
│   │   └── logger.ts    # Winston logger configuration
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── logs/                # Log files (generated)
├── dist/                # Compiled JavaScript (generated)
└── package.json         # Dependencies and scripts
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `API_VERSION` | API version | `v1` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level (error/warn/info/http/debug) | `warn` (prod) / `debug` (dev) |
| `LOG_DIR` | Directory for log files | `logs` |

## Logging

The application uses Winston for structured logging with the following features:

- **Structured Logging**: JSON format in production, readable format in development
- **Log Levels**: error, warn, info, http, debug
- **File Rotation**: Daily log rotation with automatic compression
- **Separate Log Files**:
  - `error-*.log`: Only error-level logs
  - `combined-*.log`: All log levels
  - `exceptions-*.log`: Uncaught exceptions
  - `rejections-*.log`: Unhandled promise rejections
- **Request ID Tracking**: Every request gets a unique ID for distributed tracing
- **Log Retention**: 14 days with automatic cleanup

### Using the Logger

```typescript
import { log } from './utils/logger';

// Log with different levels
log.error('Error message', { context: 'additional data' });
log.warn('Warning message', { userId: 123 });
log.info('Info message', { action: 'user_login' });
log.http('HTTP request', { method: 'GET', url: '/api/users' });
log.debug('Debug message', { variable: 'value' });
```

## Error Handling

The application includes a comprehensive error handling system:

- **Error Codes**: Categorized error codes (BAD_REQUEST, NOT_FOUND, etc.)
- **Error Logging**: All errors are automatically logged with context
- **Request Tracking**: Errors include request ID for tracing
- **Error Response Format**:
  ```json
  {
    "success": false,
    "error": {
      "message": "Error message",
      "statusCode": 404,
      "errorCode": "NOT_FOUND",
      "requestId": "uuid-here",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Error Helpers

```typescript
import { 
  ApiError, 
  ErrorCode,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  asyncHandler 
} from './middleware/errorHandler';

// Create custom error
throw new ApiError(400, 'Invalid input', ErrorCode.VALIDATION_ERROR);

// Use helper functions
throw createValidationError('Email is required');
throw createNotFoundError('User', '123');
throw createUnauthorizedError('Invalid token');

// Wrap async route handlers
router.get('/users', asyncHandler(async (req, res) => {
  // Async code that might throw
}));
```

## Security

- Helmet.js for HTTP headers security
- CORS configuration
- Rate limiting to prevent abuse
- Input validation ready
- Error messages sanitized in production
- Sensitive data redacted in logs (passwords, tokens, etc.)

## License

ISC

