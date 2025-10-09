# NestJS Backend with DrizzleORM

## Architecture Overview

This NestJS application follows best practices with a clean architecture approach:

### 🏗️ Project Structure

```
src/
├── app.module.ts           # Root module
├── main.ts                 # Application entry point
├── db/                     # Database layer
│   ├── schema/            # DrizzleORM schemas
│   │   ├── todos.schema.ts
│   │   └── index.ts
│   └── seed.ts            # Database seeder
├── drizzle/               # DrizzleORM module
│   └── drizzle.module.ts  # Global database module
└── todos/                 # Todo feature module
    ├── dto/               # Data Transfer Objects
    │   ├── create-todo.dto.ts
    │   └── update-todo.dto.ts
    ├── interfaces/        # Interfaces & contracts
    │   └── todo-repository.interface.ts
    ├── repositories/      # Repository pattern implementation
    │   └── todo.repository.ts
    ├── todos.controller.ts
    ├── todos.service.ts
    └── todos.module.ts
```

### 🎯 Key Design Decisions

1. **DrizzleORM as a Separate Module**: The database configuration is isolated in its own global module (`DrizzleModule`), making it reusable across the application and maintaining separation of concerns.

2. **Repository Pattern**: The Todo module implements the repository pattern with:
   - Interface definition (`ITodoRepository`)
   - Concrete implementation (`TodoRepository`)
   - This allows for easy testing and potential database switching

3. **Module Organization**: Each feature (todos) is its own module with clear separation between:
   - Controllers (HTTP layer)
   - Services (Business logic)
   - Repositories (Data access layer)
   - DTOs (Data validation and transformation)

4. **Schema-First Approach**: DrizzleORM schemas define the database structure with TypeScript, providing type safety throughout the application.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm
- Docker and Docker Compose

### Setup

1. **Start the database containers:**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations:**
   ```bash
   # Generate migration files from schema
   pnpm db:generate

   # Apply migrations to database
   pnpm db:push
   ```

5. **Seed the database (optional):**
   ```bash
   pnpm db:seed
   ```

6. **Start the development server:**
   ```bash
   pnpm start:dev
   ```

The API will be available at `http://localhost:3010/api`

## 📚 Database Management

### Available Commands

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Run pending migrations
- `pnpm db:push` - Push schema directly to database (development)
- `pnpm db:studio` - Open DrizzleKit Studio for database exploration
- `pnpm db:seed` - Seed the database with sample data

### Migration Workflow

1. **Schema Changes**: Modify schemas in `src/db/schema/`
2. **Generate Migration**: Run `pnpm db:generate`
3. **Review Migration**: Check the generated SQL in `drizzle/` folder
4. **Apply Migration**: Run `pnpm db:migrate` in production or `pnpm db:push` in development

## 🔄 API Endpoints

### Todos

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a specific todo
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

### Request/Response Examples

**Create Todo:**
```json
POST /api/todos
{
  "title": "Learn DrizzleORM",
  "description": "Explore DrizzleORM features",
  "completed": false
}
```

**Update Todo:**
```json
PATCH /api/todos/1
{
  "completed": true
}
```

## 🏭 Production Considerations

1. **Environment Variables**: Use proper secrets management for production
2. **Migrations**: Use `db:migrate` instead of `db:push` in production
3. **Connection Pooling**: Configure appropriate connection pool sizes
4. **Monitoring**: Add logging and monitoring for database queries
5. **Validation**: Consider adding `class-validator` for DTO validation
6. **Documentation**: Add Swagger/OpenAPI documentation

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📦 Next Steps

1. **Add Validation**: Install and configure `class-validator` and `class-transformer`
2. **Add Swagger**: Document API with `@nestjs/swagger`
3. **Add Authentication**: Implement JWT authentication
4. **Add Caching**: Integrate Redis for caching
5. **Add Logging**: Configure proper logging with Winston or Pino
6. **Add Health Checks**: Implement health check endpoints
7. **Add Rate Limiting**: Protect API with rate limiting