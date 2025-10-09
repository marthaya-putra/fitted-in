# API Testing Guide

## Quick Start

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Create the database tables:**
   ```bash
   cd apps/backend
   pnpm db:push
   ```

3. **Start the application:**
   ```bash
   pnpm start:dev
   ```

## Test Commands

### Create a Todo
```bash
curl -X POST http://localhost:3010/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Todo",
    "description": "This is a test todo item",
    "completed": false
  }'
```

### Get All Todos
```bash
curl http://localhost:3010/api/todos
```

### Get a Specific Todo
```bash
curl http://localhost:3010/api/todos/1
```

### Update a Todo
```bash
curl -X PATCH http://localhost:3010/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

### Delete a Todo
```bash
curl -X DELETE http://localhost:3010/api/todos/1
```

## Validation Testing

### Invalid Request (Missing Title)
```bash
curl -X POST http://localhost:3010/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Missing title"
  }'
```
Expected: 400 Bad Request with validation error

### Invalid Request (Wrong Type)
```bash
curl -X POST http://localhost:3010/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "completed": "not-a-boolean"
  }'
```
Expected: 400 Bad Request with validation error

### Invalid Request (Extra Fields)
```bash
curl -X POST http://localhost:3010/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "unknownField": "should be rejected"
  }'
```
Expected: 400 Bad Request (forbidNonWhitelisted)

## Database Management

### View Database with DrizzleKit Studio
```bash
cd apps/backend
pnpm db:studio
```
Then open http://localhost:4983

### Seed Sample Data
```bash
cd apps/backend
pnpm db:seed
```

### Check Database Logs
```bash
docker-compose logs postgres
```

### Access PostgreSQL CLI
```bash
docker exec -it nest-postgres psql -U postgres -d nestdb
```

Common PostgreSQL commands:
- `\dt` - List all tables
- `SELECT * FROM todos;` - View all todos
- `\q` - Exit
