# Zuanga API Architecture

## Overview

This API follows the **enterprise-grade layered architecture** pattern used by top software companies (Google, Microsoft, Amazon, etc.). This ensures:

- **Separation of Concerns**: Each layer has a single responsibility
- **Maintainability**: Easy to understand and modify
- **Testability**: Each layer can be tested independently
- **Scalability**: Easy to add new features without breaking existing code
- **Reusability**: Business logic can be reused across different endpoints

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Routes (HTTP Layer)             │
│  - Define endpoints                     │
│  - Apply middleware (auth, validation)  │
│  - Call controllers                     │
└─────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│      Controllers (Request/Response)      │
│  - Handle HTTP requests/responses        │
│  - Extract data from requests            │
│  - Format responses                     │
│  - Call services                        │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│      Services (Business Logic)          │
│  - Implement business rules              │
│  - Coordinate between models             │
│  - Handle complex operations            │
│  - Call models                          │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│      Models (Data Access)                │
│  - Database queries                      │
│  - Data transformations                 │
│  - CRUD operations                      │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│         Database (PostgreSQL)            │
└─────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Routes (`src/routes/v1/`)
**Purpose**: Define API endpoints and apply middleware

**Responsibilities**:
- Define HTTP routes (GET, POST, PUT, DELETE)
- Apply middleware (authentication, validation, authorization)
- Call controller methods
- **DO NOT** contain business logic

**Example**:
```typescript
router.post(
  '/rides',
  authenticate,
  loadUser,
  requireRole(UserRole.PARENT),
  validate(createRideSchema),
  RideController.createRide
);
```

### 2. Controllers (`src/controllers/`)
**Purpose**: Handle HTTP request/response cycle

**Responsibilities**:
- Extract data from `req.body`, `req.params`, `req.query`
- Call service methods
- Format HTTP responses
- Handle HTTP-specific errors (status codes)
- **DO NOT** contain business logic

**Example**:
```typescript
static async createRide(req: Request, res: Response): Promise<void> {
  try {
    const rideInput: CreateRideInput = req.body;
    const ride = await RideService.createRide(rideInput, req.user.id);
    res.status(201).json({ success: true, data: { ride } });
  } catch (error) {
    // Handle HTTP errors
  }
}
```

### 3. Services (`src/services/`)
**Purpose**: Implement business logic

**Responsibilities**:
- Implement business rules and validations
- Coordinate between multiple models
- Handle complex operations (e.g., ride creation with distance calculation)
- Throw domain-specific errors
- **DO NOT** know about HTTP (no `req`/`res`)

**Example**:
```typescript
static async createRide(input: CreateRideInput, parentId: string): Promise<Ride> {
  // Business logic: verify kid belongs to parent
  const kid = await KidModel.findById(input.kid_id);
  if (!kid || kid.parent_id !== parentId) {
    throw new Error('Kid does not belong to parent');
  }
  
  // Business logic: calculate distance and fare
  const distanceKm = calculateDistance(...);
  const totalFare = calculateFare(distanceKm, input.base_fare);
  
  return await RideModel.create({ ...input, total_fare: totalFare });
}
```

### 4. Models (`src/models/`)
**Purpose**: Data access layer

**Responsibilities**:
- Database queries (SQL)
- Data transformations
- CRUD operations
- **DO NOT** contain business logic

**Example**:
```typescript
static async create(input: CreateRideInput): Promise<Ride> {
  const [ride] = await sql<Ride[]>`
    INSERT INTO rides (kid_id, ride_type, ...)
    VALUES (${input.kid_id}, ${input.ride_type}, ...)
    RETURNING *
  `;
  return ride;
}
```

## File Structure

```
src/
├── routes/v1/          # HTTP routes (thin layer)
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── drivers.routes.ts
│   ├── schools.routes.ts
│   └── rides.routes.ts
│
├── controllers/        # Request/response handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── driver.controller.ts
│   ├── school.controller.ts
│   └── ride.controller.ts
│
├── services/           # Business logic
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── driver.service.ts
│   ├── school.service.ts
│   └── ride.service.ts
│
├── models/             # Data access
│   ├── User.ts
│   ├── Kid.ts
│   ├── School.ts
│   ├── Ride.ts
│   └── ...
│
├── validators/         # Input validation schemas
├── middleware/         # Express middleware
└── auth/              # Authentication utilities
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
- Each layer has a single, well-defined responsibility
- Changes in one layer don't affect others

### 2. **Testability**
- Services can be tested without HTTP (unit tests)
- Controllers can be tested with mocked services
- Models can be tested with mocked database

### 3. **Maintainability**
- Easy to find where code lives
- Clear boundaries between layers
- Easy to understand data flow

### 4. **Scalability**
- Easy to add new features
- Business logic is reusable
- Can swap implementations (e.g., different database)

### 5. **Team Collaboration**
- Frontend developers work with routes/controllers
- Backend developers work with services/models
- Clear ownership of code

## Best Practices

### ✅ DO:
- Keep routes thin - only middleware and controller calls
- Put all business logic in services
- Use services to coordinate between models
- Throw domain errors from services (not HTTP errors)
- Handle HTTP errors in controllers

### ❌ DON'T:
- Put business logic in routes or controllers
- Call models directly from routes
- Put HTTP-specific code in services
- Mix concerns (e.g., database queries in controllers)

## Example Flow: Creating a Ride

1. **Route** (`rides.routes.ts`):
   ```typescript
   router.post('/', authenticate, loadUser, requireRole(UserRole.PARENT), 
     validate(createRideSchema), RideController.createRide);
   ```

2. **Controller** (`ride.controller.ts`):
   ```typescript
   static async createRide(req: Request, res: Response) {
     const rideInput = req.body;
     const ride = await RideService.createRide(rideInput, req.user.id);
     res.status(201).json({ success: true, data: { ride } });
   }
   ```

3. **Service** (`ride.service.ts`):
   ```typescript
   static async createRide(input: CreateRideInput, parentId: string) {
     // Verify kid belongs to parent
     const kid = await KidModel.findById(input.kid_id);
     if (kid.parent_id !== parentId) throw new Error('Access denied');
     
     // Calculate distance and fare
     const distance = calculateDistance(...);
     const fare = calculateFare(distance, input.base_fare);
     
     // Create ride
     return await RideModel.create({ ...input, total_fare: fare });
   }
   ```

4. **Model** (`Ride.ts`):
   ```typescript
   static async create(input: CreateRideInput): Promise<Ride> {
     const [ride] = await sql`INSERT INTO rides ... RETURNING *`;
     return ride;
   }
   ```

## Industry Standards

This architecture follows patterns used by:
- **Google**: Clean Architecture / Layered Architecture
- **Microsoft**: N-Tier Architecture
- **Amazon**: Service-Oriented Architecture (SOA)
- **Netflix**: Microservices with clear boundaries
- **Uber**: Domain-Driven Design (DDD) with service layers

## Summary

The **Routes → Controllers → Services → Models** pattern ensures:
- ✅ Clean code organization
- ✅ Easy testing and maintenance
- ✅ Scalable architecture
- ✅ Industry best practices
- ✅ Team collaboration

This is the standard architecture used by enterprise applications worldwide.

