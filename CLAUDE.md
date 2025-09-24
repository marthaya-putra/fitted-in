# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turbo monorepo containing three applications: a Next.js admin dashboard, a NestJS backend API, and a Chrome extension with React. The project uses TypeScript across all applications and Turbo for orchestration.

## Architecture

### Monorepo Structure
- **Turbo** manages the monorepo with workspaces for `apps/*` and `packages/*`
- **Shared configuration** through root-level package.json and turbo.json
- **Independent builds** with dependency management between apps

### Applications

1. **Admin Dashboard** (`apps/admin`)
   - Next.js 15 with App Router
   - Tailwind CSS for styling
   - Runs on port 3000
   - Standard Next.js build pipeline

2. **Backend API** (`apps/backend`)
   - NestJS framework
   - Runs on port 3001
   - Jest for testing
   - Standard NestJS module structure

3. **Chrome Extension** (`apps/extension`)
   - React 18 with TypeScript
   - Vite build system
   - Manifest V3
   - Dev server on port 5173
   - Features: storage permissions, activeTab access, sidePanel support

## Development Commands

### Root Level Commands
```bash
pnpm run dev     # Start all apps in development
pnpm run build   # Build all apps
pnpm run lint    # Lint all apps
pnpm run format  # Format all files with Prettier
pnpm run clean   # Clean all build artifacts
```

### Package Management
This project uses **pnpm** as the package manager. Always use `pnpm` instead of `npm` for all operations.

```bash
pnpm install      # Install dependencies
pnpm add <pkg>    # Add a package
pnpm remove <pkg> # Remove a package
```

### App-Specific Commands

**Admin (Next.js)**
```bash
cd apps/admin
pnpm run dev    # Development server
pnpm run build  # Production build
pnpm run start  # Start production server
pnpm run lint   # ESLint
```

**Backend (NestJS)**
```bash
cd apps/backend
pnpm run start:dev    # Development with watch
pnpm run start:debug  # Debug mode
pnpm run build        # Production build
pnpm run start:prod   # Production server
pnpm run test         # Jest tests
pnpm run test:watch   # Jest with watch
pnpm run test:cov     # Coverage report
```

**Extension (Chrome)**
```bash
cd apps/extension
pnpm run dev      # Vite dev server
pnpm run build    # Production build
pnpm run preview  # Preview build
pnpm run lint     # ESLint
```

## Technology Stack

- **Monorepo**: Turbo
- **Language**: TypeScript 5+
- **Admin**: Next.js 15, React 18, Tailwind CSS
- **Backend**: NestJS 10, Express
- **Extension**: React 18, Vite, Chrome Manifest V3
- **Testing**: Jest (backend), ESLint (all apps)
- **Code Quality**: Prettier, ESLint

## Port Configuration

- Admin Dashboard: http://localhost:3000
- Backend API: http://localhost:3001
- Extension Dev: http://localhost:5173

## Build Pipeline

Turbo handles build dependencies with the following pipeline:
- `build` tasks depend on `^build` (upstream builds)
- Outputs cached to `.next/` and `dist/` directories
- Development mode runs with `cache: false` and `persistent: true`

Refer to `.env.local` for environment file in development server