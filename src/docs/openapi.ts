/**
 * OpenAPI (Swagger) specification for Zuanga API.
 *
 * We keep this as a simple, explicit object to avoid complicated build-time scanning.
 * If you want automatic generation later (swagger-jsdoc, tsoa, etc.), we can switch.
 */

/**
 * Common response shapes.
 * NOTE: The API uses a `success` boolean wrapper across endpoints.
 */
const SuccessResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: { type: 'object' },
  },
} as const;

const ErrorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        statusCode: { type: 'number' },
      },
    },
  },
} as const;

/**
 * Request body examples.
 * NOTE: These are aligned to the Zod validators in `src/validators/*`.
 */
const Examples = {
  // Auth
  authRegisterParent: {
    email: 'parent@example.com',
    phone: '15551234567',
    password: 'P@ssw0rd123',
    first_name: 'Jane',
    last_name: 'Doe',
    role: 'PARENT',
  },
  authRegisterDriver: {
    email: 'driver@example.com',
    phone: '15557654321',
    password: 'P@ssw0rd123',
    first_name: 'John',
    last_name: 'Driver',
    role: 'DRIVER',
    license_number: 'D1234567',
    vehicle_make: 'Toyota',
    vehicle_model: 'Camry',
    vehicle_color: 'Black',
    vehicle_plate_number: 'ABC-1234',
  },
  authLogin: {
    email: 'parent@example.com',
    password: 'P@ssw0rd123',
  },
  authRefresh: {
    refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },

  // OTP
  otpStart: {
    phone: '15551234567',
    brand: 'Zuanga',
  },
  otpCheck: {
    request_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    code: '1234',
  },
  otpCancel: {
    request_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  },

  // Users / Kids
  userUpdateProfile: {
    first_name: 'Jane',
    last_name: 'Doe',
    phone: '15551234567',
    profile_image_url: '',
  },
  kidCreate: {
    school_id: '11111111-1111-1111-1111-111111111111',
    first_name: 'Sam',
    last_name: 'Doe',
    date_of_birth: '2015-08-24',
    grade: '4',
    pickup_address: '123 Main St, Austin, TX',
    pickup_latitude: 30.2672,
    pickup_longitude: -97.7431,
    dropoff_address: '456 Oak Ave, Austin, TX',
    dropoff_latitude: 30.2701,
    dropoff_longitude: -97.7502,
    emergency_contact_name: 'Aunt Mary',
    emergency_contact_phone: '15550001111',
    profile_image_url: '',
  },
  kidUpdate: {
    grade: '5',
    profile_image_url: '',
    is_active: true,
  },

  // Drivers
  driverStatus: {
    is_available: true,
    current_latitude: 30.2672,
    current_longitude: -97.7431,
  },

  // Schools
  schoolCreate: {
    name: 'Austin Elementary',
    address: '100 School Rd',
    city: 'Austin',
    state: 'TX',
    country: 'US',
    postal_code: '78701',
    latitude: 30.2672,
    longitude: -97.7431,
    phone: '15552223333',
    email: 'info@austin-elementary.edu',
    website: 'https://austin-elementary.edu',
    start_time: '08:00:00',
    end_time: '15:00:00',
  },
  schoolUpdate: {
    phone: '15553334444',
    website: 'https://austin-elementary.edu',
    is_active: true,
  },

  // Rides
  rideCreate: {
    kid_id: '22222222-2222-2222-2222-222222222222',
    ride_type: 'TO_SCHOOL',
    scheduled_pickup_time: '2026-01-24T07:30:00.000Z',
    scheduled_dropoff_time: '2026-01-24T08:00:00.000Z',
    pickup_address: '123 Main St, Austin, TX',
    pickup_latitude: 30.2672,
    pickup_longitude: -97.7431,
    dropoff_address: '100 School Rd, Austin, TX',
    dropoff_latitude: 30.2701,
    dropoff_longitude: -97.7502,
    base_fare: 8.0,
    distance_fare: 2.5,
    total_fare: 10.5,
    parent_notes: 'Please call on arrival.',
    route_id: '33333333-3333-3333-3333-333333333333',
  },
  rideCancel: {
    status: 'CANCELLED',
    cancellation_reason: 'Schedule changed',
  },

  // Routes
  routeCreate: {
    school_id: '11111111-1111-1111-1111-111111111111',
    proposed_driver_id: '44444444-4444-4444-4444-444444444444',
    name: 'Morning Pickup Route',
    description: 'Optimized pickups for the north neighborhood.',
    waypoints: [
      { latitude: 30.2672, longitude: -97.7431, address: '123 Main St', order: 1 },
      { latitude: 30.2701, longitude: -97.7502, address: '456 Oak Ave', order: 2 },
    ],
    estimated_distance_km: 12.4,
    estimated_duration_minutes: 28,
  },
  routeOptimize: {
    school_id: '11111111-1111-1111-1111-111111111111',
    proposed_driver_id: '44444444-4444-4444-4444-444444444444',
    waypoints: [
      { latitude: 30.2672, longitude: -97.7431, address: '123 Main St' },
      { latitude: 30.2701, longitude: -97.7502, address: '456 Oak Ave' },
    ],
    name: 'Optimized Route',
  },
  routeUpdate: {
    name: 'Updated Route Name',
    is_active: true,
  },

  // Tracking
  trackingUpdateLocation: {
    latitude: 30.268,
    longitude: -97.744,
    accuracy: 5,
    heading: 90,
    speed: 12.3,
  },

  // Subscriptions
  subscriptionCreate: {
    kid_id: '22222222-2222-2222-2222-222222222222',
    school_id: '11111111-1111-1111-1111-111111111111',
    subscription_type: 'WEEKLY',
    start_date: '2026-02-01',
    end_date: null,
    days_of_week: [1, 2, 3, 4, 5],
    pickup_time: '07:30',
    dropoff_time: '08:00',
    pickup_address: '123 Main St, Austin, TX',
    pickup_latitude: 30.2672,
    pickup_longitude: -97.7431,
    dropoff_address: '100 School Rd, Austin, TX',
    dropoff_latitude: 30.2701,
    dropoff_longitude: -97.7502,
    base_fare: 8.0,
    distance_fare: 2.5,
    total_fare_per_ride: 10.5,
    subscription_total: null,
    parent_notes: 'Same pickup spot every day.',
    auto_generate_rides: true,
  },
  subscriptionUpdate: {
    status: 'PAUSED',
    end_date: null,
    days_of_week: [1, 3, 5],
    pickup_time: '07:45',
    dropoff_time: null,
    parent_notes: 'Only M/W/F for now.',
  },

  // Admin
  adminUpdateUser: {
    first_name: 'Jane',
    last_name: 'Doe',
    phone: '15551234567',
    profile_image_url: '',
    is_active: true,
  },
} as const;

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Zuanga API',
    version: process.env.npm_package_version || '1.0.0',
    description:
      'Zuanga API documentation (Swagger UI). Use the servers list to switch between Local, Sandbox, and Production. ' +
      'Protected endpoints require an access token via `Authorization: Bearer <JWT>`.',
  },
  servers: [
    // Local development (same host). Good when running the API on localhost.
    { url: '/api/v1', description: 'Local (same host) - API v1' },
    // Hosted environments (Sandbox / Production) using a server variable.
    // NOTE: Update the domain pattern to your real hosts if different.
    {
      url: 'https://{environment}.zuanga.com/api/v1',
      description: 'Hosted environments (Sandbox / Production)',
      variables: {
        environment: {
          default: 'sandbox',
          enum: ['sandbox', 'api'],
          description: 'Use `sandbox` for Sandbox, `api` for Production',
        },
      },
    },
  ],
  tags: [
    // High-level grouping to keep Swagger navigable and “production ready”.
    { name: 'Health', description: 'Service health and uptime' },
    { name: 'Auth', description: 'Authentication and tokens' },
    { name: 'OTP', description: 'SMS verification via Vonage Verify' },
    { name: 'Users', description: 'User profile and kids management' },
    { name: 'Drivers', description: 'Driver discovery and status' },
    { name: 'Schools', description: 'School management' },
    { name: 'Rides', description: 'Ride booking and lifecycle' },
    { name: 'Routes', description: 'Route planning and proposals' },
    { name: 'Tracking', description: 'Real-time ride tracking' },
    { name: 'Subscriptions', description: 'Subscription management' },
    { name: 'Admin', description: 'Admin-only operations' },
  ],
  components: {
    securitySchemes: {
      // JWT access token via Authorization: Bearer <token>
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: {
          '200': { description: 'Healthy', content: { 'application/json': { schema: SuccessResponse } } },
        },
      },
    },
    // --------------------
    // Auth
    // --------------------
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              examples: {
                parent: { value: Examples.authRegisterParent },
                driver: { value: Examples.authRegisterDriver },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
          '409': { description: 'Conflict', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              examples: { default: { value: Examples.authLogin } },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              examples: { default: { value: Examples.authRefresh } },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    // OTP endpoints (Vonage Verify)
    '/auth/otp/start': {
      post: {
        summary: 'Start OTP verification (SMS)',
        tags: ['OTP'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  phone: { type: 'string', example: '33753754960' },
                  // Alternative key supported by our API for compatibility with Vonage examples
                  number: { type: 'string', example: '33753754960' },
                  brand: { type: 'string', example: 'Zuanga' },
                },
              },
              examples: { default: { value: Examples.otpStart } },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/auth/otp/check': {
      post: {
        summary: 'Verify OTP code',
        tags: ['OTP'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['request_id', 'code'],
                properties: {
                  request_id: { type: 'string' },
                  code: { type: 'string', example: '1234' },
                },
              },
              examples: { default: { value: Examples.otpCheck } },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/auth/otp/cancel': {
      post: {
        summary: 'Cancel OTP request',
        tags: ['OTP'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['request_id'],
                properties: {
                  request_id: { type: 'string' },
                },
              },
              examples: { default: { value: Examples.otpCancel } },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },

    // --------------------
    // Users
    // --------------------
    '/users/profile': {
      get: {
        summary: 'Get current user profile',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      put: {
        summary: 'Update current user profile',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateProfileSchema`
              examples: { default: { value: Examples.userUpdateProfile } },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/users/kids': {
      get: {
        summary: 'Get all kids for the current parent',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      post: {
        summary: 'Add a kid for the current parent',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `createKidSchema`
              examples: { default: { value: Examples.kidCreate } },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/users/kids/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      get: {
        summary: 'Get kid by ID',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
          '404': { description: 'Not Found', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      put: {
        summary: 'Update kid',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateKidSchema`
              examples: { default: { value: Examples.kidUpdate } },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      delete: {
        summary: 'Delete kid (soft delete)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },

    // --------------------
    // Drivers
    // --------------------
    '/drivers': {
      get: {
        summary: 'List available drivers',
        tags: ['Drivers'],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
        },
      },
    },
    '/drivers/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get driver details',
        tags: ['Drivers'],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '404': { description: 'Not Found', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/drivers/status': {
      put: {
        summary: 'Update driver availability status',
        tags: ['Drivers'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateDriverStatus` expectations (driver profile fields)
              examples: { default: { value: Examples.driverStatus } },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },

    // --------------------
    // Schools
    // --------------------
    '/schools': {
      get: {
        summary: 'List all schools',
        tags: ['Schools'],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
        },
      },
      post: {
        summary: 'Create school (admin or parent)',
        tags: ['Schools'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `createSchoolSchema`
              examples: { default: { value: Examples.schoolCreate } },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/schools/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get school by ID',
        tags: ['Schools'],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '404': { description: 'Not Found', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      put: {
        summary: 'Update school (admin or parent)',
        tags: ['Schools'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateSchoolSchema`
              examples: { default: { value: Examples.schoolUpdate } },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      delete: {
        summary: 'Delete school (soft delete)',
        tags: ['Schools'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },

    // --------------------
    // Rides
    // --------------------
    '/rides': {
      post: {
        summary: 'Book a ride (parent or admin)',
        tags: ['Rides'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `createRideSchema`
              examples: { default: { value: Examples.rideCreate } },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      get: {
        summary: 'List rides (filtered by user role)',
        tags: ['Rides'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/rides/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get ride details',
        tags: ['Rides'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '404': { description: 'Not Found', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/rides/{id}/accept': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Driver accepts ride',
        tags: ['Rides'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/rides/{id}/start': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Driver starts ride',
        tags: ['Rides'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/rides/{id}/pickup': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Driver marks ride as picked up',
        tags: ['Rides'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/rides/{id}/complete': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Driver completes ride',
        tags: ['Rides'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/rides/{id}/cancel': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Cancel ride',
        tags: ['Rides'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateRideStatusSchema`
              examples: { default: { value: Examples.rideCancel } },
            },
          },
        },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },

    // --------------------
    // Routes
    // --------------------
    '/routes': {
      get: {
        summary: 'List routes (optionally filtered by school or driver)',
        tags: ['Routes'],
        parameters: [
          { name: 'school_id', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'driver_id', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'active', in: 'query', required: false, schema: { type: 'boolean' } },
        ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
      post: {
        summary: 'Create a new route',
        tags: ['Routes'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `createRouteSchema`
              examples: { default: { value: Examples.routeCreate } },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: ErrorResponse } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
    },
    '/routes/optimize': {
      post: {
        summary: 'Optimize route for multiple pickups',
        tags: ['Routes'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `optimizeRouteSchema`
              examples: { default: { value: Examples.routeOptimize } },
            },
          },
        },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/routes/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get route by ID',
        tags: ['Routes'],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
      put: {
        summary: 'Update route',
        tags: ['Routes'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateRouteSchema`
              examples: { default: { value: Examples.routeUpdate } },
            },
          },
        },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
      delete: {
        summary: 'Delete route (soft delete)',
        tags: ['Routes'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/routes/school/{schoolId}': {
      parameters: [{ name: 'schoolId', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get routes by school',
        tags: ['Routes'],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/routes/driver/{driverId}': {
      parameters: [{ name: 'driverId', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get routes by driver',
        tags: ['Routes'],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/routes/proposed': {
      get: {
        summary: 'Get routes proposed to current driver',
        tags: ['Routes'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/routes/{id}/accept': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Accept route proposal (driver)',
        tags: ['Routes'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/routes/{id}/reject': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Reject route proposal (driver)',
        tags: ['Routes'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },

    // --------------------
    // Tracking
    // --------------------
    '/tracking/{rideId}/location': {
      parameters: [{ name: 'rideId', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        summary: 'Update driver location for a ride',
        tags: ['Tracking'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateLocationSchema`
              examples: { default: { value: Examples.trackingUpdateLocation } },
            },
          },
        },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/tracking/{rideId}': {
      parameters: [{ name: 'rideId', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get current ride location',
        tags: ['Tracking'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/tracking/{rideId}/history': {
      parameters: [{ name: 'rideId', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get ride location history',
        tags: ['Tracking'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },

    // --------------------
    // Subscriptions
    // --------------------
    '/subscriptions': {
      post: {
        summary: 'Create a new subscription',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `createSubscriptionSchema`
              examples: { default: { value: Examples.subscriptionCreate } },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: SuccessResponse } } },
          '400': { description: 'Bad Request', content: { 'application/json': { schema: ErrorResponse } } },
        },
      },
      get: {
        summary: 'Get subscriptions for current parent',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'active', in: 'query', required: false, schema: { type: 'boolean' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/subscriptions/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get subscription by ID',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
      put: {
        summary: 'Update subscription',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateSubscriptionSchema`
              examples: { default: { value: Examples.subscriptionUpdate } },
            },
          },
        },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/subscriptions/{id}/pause': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Pause subscription',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/subscriptions/{id}/resume': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Resume subscription',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/subscriptions/{id}/cancel': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Cancel subscription',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/subscriptions/{id}/generate-rides': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      post: {
        summary: 'Manually generate rides for subscription',
        tags: ['Subscriptions'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },

    // --------------------
    // Admin
    // --------------------
    '/admin/users': {
      get: {
        summary: 'Get all users (parents and drivers)',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'role', in: 'query', required: false, schema: { type: 'string', example: 'PARENT' } },
          { name: 'active', in: 'query', required: false, schema: { type: 'boolean' } },
        ],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/admin/users/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: {
        summary: 'Get user by ID',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
      put: {
        summary: 'Update user account',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object' },
              // Example aligned to `updateUserSchema` (admin)
              examples: { default: { value: Examples.adminUpdateUser } },
            },
          },
        },
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/admin/users/{id}/deactivate': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Deactivate user account',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/admin/users/{id}/activate': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      put: {
        summary: 'Activate user account',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/admin/parents': {
      get: {
        summary: 'Get all parents',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'active', in: 'query', required: false, schema: { type: 'boolean' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/admin/drivers': {
      get: {
        summary: 'Get all drivers',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'active', in: 'query', required: false, schema: { type: 'boolean' } }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
    '/admin/stats': {
      get: {
        summary: 'Get user statistics',
        tags: ['Admin'],
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK', content: { 'application/json': { schema: SuccessResponse } } } },
      },
    },
  },
} as const;

