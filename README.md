# FittedIn 🎯

**Your AI-powered resume optimizer that helps you land more interviews**

FittedIn automatically tailors your resume to match any job posting, making your application stand out from the crowd. Stop spending hours manually editing your CV for each application - let AI do the work for you.

## How It Works

1. **Create Your Master Resume** - Build your comprehensive resume once through our web dashboard
2. **Browse Jobs on LinkedIn** - Find a job you're interested in
3. **Click to Optimize** - Our Chrome extension automatically tailors your resume for that specific role
4. **Apply with Confidence** - Send a perfectly customized resume that highlights your most relevant experience

## What's Inside

### 📝 Resume Builder (Web Dashboard)

- Create and manage your master resume with an easy-to-use form
- Upload an existing PDF resume - we'll automatically extract all the details
- Store your information securely in the cloud

### 🤖 AI Optimization Engine

- Analyzes job descriptions to identify key requirements
- Rewrites your professional summary to match the role
- Tailors your work experience to highlight relevant achievements
- Optimizes your skills section based on what the employer is looking for

### 🚀 Chrome Extension

- Works seamlessly on LinkedIn job pages
- One-click resume optimization right from your browser
- See your optimized resume update in real-time
- Copy and paste your tailored resume instantly

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm package manager
- PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fitted-in
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up your environment**
   - Copy `.env.example` to `.env`
   - Fill in your database and API keys

4. **Start all applications**
   ```bash
   pnpm run dev
   ```

### Access Points

- **Resume Builder**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Extension Dev**: http://localhost:5173

## For Developers

This is a Turbo monorepo with three applications:

### Applications Overview

- **admin** (`apps/admin`) - Next.js dashboard for resume management
- **backend** (`apps/backend`) - NestJS API with AI optimization services
- **extension** (`apps/extension`) - Chrome extension for LinkedIn integration

### Common Commands

```bash
# Install dependencies
pnpm install

# Start all apps in development
pnpm run dev

# Build all applications
pnpm run build

# Lint all code
pnpm run lint

# Format all files
pnpm run format
```

### Individual App Commands

```bash
# Admin Dashboard
cd apps/admin
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run start    # Start production server

# Backend API
cd apps/backend
pnpm run start:dev  # Start with auto-reload
pnpm run build     # Build for production
pnpm run test      # Run tests

# Chrome Extension
cd apps/extension
pnpm run dev       # Start development server
pnpm run build     # Build extension package
```

## Project Structure

```
fitted-in/
├── apps/
│   ├── admin/          # Next.js resume builder dashboard
│   ├── backend/        # NestJS API with AI services
│   └── extension/      # Chrome extension for LinkedIn
```

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth for secure user management
- **AI**: Google AI SDK for resume optimization
- **Extension**: React, Vite, Chrome Manifest V3
- **Monorepo**: Turbo for managing multiple applications
