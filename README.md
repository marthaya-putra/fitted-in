# fitted-in

A Turbo monorepo with three applications:

## Apps

1. **admin** - Next.js admin dashboard
2. **backend** - NestJS backend API
3. **extension** - Chrome extension with React

## Development

Install dependencies:

```bash
npm install
```

Run all apps in development:

```bash
npm run dev
```

Build all apps:

```bash
npm run build
```

## App-specific commands

### Admin (Next.js)

```bash
cd apps/admin
npm run dev    # Development server
npm run build  # Production build
npm run start  # Start production server
```

### Backend (NestJS)

```bash
cd apps/backend
npm run start:dev  # Development server with watch
npm run build     # Production build
npm run start:prod # Start production server
```

### Extension (Chrome)

```bash
cd apps/extension
npm run dev    # Development server
npm run build  # Production build
```

## Ports

- Admin: http://localhost:3000
- Backend: http://localhost:3001
- Extension: http://localhost:5173
