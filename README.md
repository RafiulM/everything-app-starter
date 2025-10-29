# Everything App Starter

<!-- BADGES -->
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

A comprehensive full-stack application starter template built with Next.js 15, featuring authentication, database integration, AI capabilities, and modern development best practices. This template provides everything you need to build production-ready web applications quickly.

## Table of Contents

- [About This Project](#about-this-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Environment Setup](#environment-setup)
  - [Database Setup](#database-setup)
- [API Key Management](#api-key-management)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Available Scripts](#available-scripts)
  - [Database Operations](#database-operations)
  - [Docker Development](#docker-development)
- [Deployment](#deployment)
  - [Production Deployment](#production-deployment)
  - [Environment Variables for Production](#environment-variables-for-production)
  - [Deployment Options](#deployment-options)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## About This Project

The Everything App Starter is a modern, production-ready full-stack template designed to accelerate web development. Built with the latest technologies and best practices, it provides a solid foundation for building scalable, secure, and feature-rich applications.

### Key Highlights

- 🚀 **Next.js 15** with App Router and Turbopack for optimal performance
- 🔐 **Complete Authentication** system with Better Auth
- 🗄️ **Type-safe Database** with Drizzle ORM and PostgreSQL
- 🎨 **Modern UI** with 40+ shadcn/ui components and dark mode
- 🐳 **Docker Support** with multi-stage builds and development workflows
- 🤖 **AI-Ready** architecture for easy AI service integration
- 📱 **Responsive Design** with Tailwind CSS v4
- 🔒 **Security First** with modern authentication patterns and best practices

<!-- SCREENSHOTS_PLACEHOLDER -->

## Features

### 🔐 Authentication & Security
- **Complete Auth System**: Email/password authentication with Better Auth
- **Session Management**: Secure session handling with HTTP-only cookies
- **Type-Safe Auth**: Fully typed authentication with TypeScript
- **Social Login Ready**: Easy integration for OAuth providers
- **Password Security**: Secure password hashing and validation

### 🗄️ Database & Data Management
- **Type-Safe Database**: Drizzle ORM with full TypeScript support
- **PostgreSQL Integration**: Production-ready database setup
- **Database Migrations**: Easy schema management with Drizzle Kit
- **Database Studio**: Built-in database GUI with Drizzle Studio
- **Connection Pooling**: Optimized database connections

### 🎨 User Interface & Experience
- **40+ UI Components**: Complete shadcn/ui component library (New York style)
- **Dark Mode**: Automatic dark/light theme switching with system detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS v4
- **Customizable Theme**: CSS variables for easy theming
- **Modern Icons**: Lucide React icon library
- **Accessibility**: WCAG compliant components

### 🚀 Development & Performance
- **Next.js 15**: Latest version with App Router and Turbopack
- **Server Components**: Optimized server-side rendering
- **TypeScript**: Full type safety across the application
- **Hot Reload**: Fast development with instant feedback
- **Code Quality**: ESLint and Prettier pre-configured
- **AI-Optimized**: Clean structure for AI coding agents

### 🐳 Deployment & DevOps
- **Docker Support**: Multi-stage Docker builds
- **Development Workflows**: Docker Compose for local development
- **Production Ready**: Optimized builds for deployment
- **Health Checks**: Built-in application health monitoring
- **Environment Management**: Secure environment variable handling

### 🔧 Developer Experience
- **Modern Tooling**: Latest JavaScript/TypeScript ecosystem
- **Clear Documentation**: Comprehensive guides and examples
- **Database GUI**: Visual database management tools
- **CLI Scripts**: Convenient npm scripts for common tasks
- **Component Library**: Easy addition of new UI components

## Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router and Turbopack
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - High-quality component library
- **Theme System**: [next-themes](https://github.com/pacocoursey/next-themes) - Dark mode support
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon set

### Backend & Database
- **Authentication**: [Better Auth](https://better-auth.com/) - Modern authentication library
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Powerful relational database
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe SQL toolkit
- **Database Toolkit**: [Drizzle Kit](https://orm.drizzle.team/kit-docs-overview) - Database migration tool

### Development & Deployment
- **Containerization**: [Docker](https://www.docker.com/) - Container platform
- **Package Manager**: [npm](https://www.npmjs.com/) - JavaScript package manager
- **Code Quality**: [ESLint](https://eslint.org/) - JavaScript linter
- **Development Server**: [Turbopack](https://turbo.build/pack) - Fast bundler

### External Integrations Ready
- **AI Services**: Ready for OpenAI, Anthropic, and other AI providers
- **Payment Gateways**: Ready for Stripe, PayPal integration
- **Email Services**: Ready for SendGrid, Resend integration
- **File Storage**: Ready for AWS S3, Cloudflare R2 integration

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or [yarn](https://yarnpkg.com/) / [pnpm](https://pnpm.io/)
- **Docker & Docker Compose** - [Get Docker](https://docs.docker.com/get-docker/) (for database)
- **Git** - [Download Git](https://git-scm.com/)

### Quick Start

Get your application running in under 5 minutes:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/everything-app-starter.git
   cd everything-app-starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start the database and application**
   ```bash
   # Start PostgreSQL database
   npm run db:up

   # In a new terminal, start the development server
   npm run dev
   ```

5. **Visit your application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Setup

1. **Copy the environment file**
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables** (see [API Key Management](#api-key-management) for details)
   ```env
   # Database Configuration (works with Docker setup)
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
   POSTGRES_DB=postgres
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres

   # Authentication
   BETTER_AUTH_SECRET=your_secret_key_here
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   ```

3. **Generate a secure auth secret**
   ```bash
   # Generate a secure secret for Better Auth
   openssl rand -base64 32
   ```
   Copy the output and use it for `BETTER_AUTH_SECRET`.

### Database Setup

#### Option 1: Docker (Recommended)

The easiest way to get started is using the provided Docker setup:

1. **Start PostgreSQL database**
   ```bash
   npm run db:up
   ```
   This starts PostgreSQL in a Docker container with default credentials.

2. **Initialize the database schema**
   ```bash
   npm run db:push
   ```

#### Option 2: Local Database

If you prefer to use a local PostgreSQL installation:

1. **Create a PostgreSQL database**
   ```sql
   CREATE DATABASE everything_app;
   CREATE USER everything_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE everything_app TO everything_user;
   ```

2. **Update your .env file**
   ```env
   DATABASE_URL=postgresql://everything_user:your_password@localhost:5432/everything_app
   ```

3. **Run database migrations**
   ```bash
   npm run db:push
   ```

### Verify Your Setup

1. **Check database connection**
   ```bash
   npm run db:studio
   ```
   This opens Drizzle Studio in your browser where you can explore the database.

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Test authentication**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Try signing up for a new account
   - Verify you can log in and log out

### Next Steps

- [API Key Management](#api-key-management) - Set up AI service integrations
- [Project Structure](#project-structure) - Understand the codebase
- [Development](#development) - Learn about available scripts
- [Deployment](#deployment) - Deploy to production

## API Key Management

This application supports two levels of API key management for AI services and external integrations:

### Application-Level API Keys

These are set in your environment variables and are available to all users of your application.

#### AI Service Keys
Add these to your `.env` file to enable AI features:

```env
# OpenAI (optional)
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic Claude (optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google AI (optional)
GOOGLE_AI_API_KEY=your-google-ai-key-here

# Other AI Services (optional)
ANYSCALE_API_KEY=your-anyscale-key-here
TOGETHER_API_KEY=your-together-key-here
```

#### Other Service Keys
```env
# Email Services (optional)
RESEND_API_KEY=re-your-resend-key-here
SENDGRID_API_KEY=SG.your-sendgrid-key-here

# Payment Processing (optional)
STRIPE_SECRET_KEY=sk_test_your-stripe-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# File Storage (optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### User-Provided API Keys

The application also supports allowing individual users to provide their own API keys through the UI. These keys are:

- **Stored securely** in the database (encrypted at rest)
- **Isolated per user** - each user only has access to their own keys
- **Managed through the UI** - users can add, update, and remove their keys
- **Used for AI requests** - when a user makes an AI request, their personal key is used if provided

#### Setting Up User Key Management

To enable user-provided API keys:

1. **The database schema is already set up** with encrypted storage for API keys
2. **UI components are included** for key management
3. **Server-side logic automatically** uses user keys when available, falling back to application keys

#### Security Best Practices

- **Never commit API keys to version control**
- **Use environment variables for production secrets**
- **Implement key rotation policies** for production applications
- **Monitor API usage and costs** associated with each key
- **Use separate keys for development and production**
- **Consider using a secret management service** like AWS Secrets Manager or HashiCorp Vault for production

#### Getting API Keys

**OpenAI**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add `OPENAI_API_KEY` to your `.env` file

**Anthropic Claude**
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Generate an API key
3. Add `ANTHROPIC_API_KEY` to your `.env` file

**Google AI**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add `GOOGLE_AI_API_KEY` to your `.env` file

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration (defaults work with Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/postgres
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Authentication
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

## Features

- 🔐 Authentication with Better Auth (email/password)
- 🗄️ PostgreSQL Database with Drizzle ORM
- 🎨 40+ shadcn/ui components (New York style)
- 🌙 Dark mode with system preference detection
- 🚀 App Router with Server Components and Turbopack
- 📱 Responsive design with TailwindCSS v4
- 🎯 Type-safe database operations
- 🔒 Modern authentication patterns
- 🐳 Full Docker support with multi-stage builds
- 🚀 Production-ready deployment configuration

## Project Structure

```
codeguide-starter-fullstack/
├── app/                        # Next.js app router pages
│   ├── globals.css            # Global styles with dark mode
│   ├── layout.tsx             # Root layout with providers
│   └── page.tsx               # Main page
├── components/                # React components
│   └── ui/                    # shadcn/ui components (40+)
├── db/                        # Database configuration
│   ├── index.ts              # Database connection
│   └── schema/               # Database schemas
├── docker/                    # Docker configuration
│   └── postgres/             # PostgreSQL initialization
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
│   ├── auth.ts               # Better Auth configuration
│   └── utils.ts              # General utilities
├── auth-schema.ts            # Authentication schema
├── docker-compose.yml        # Docker services configuration
├── Dockerfile                # Application container definition
├── drizzle.config.ts         # Drizzle configuration
└── components.json           # shadcn/ui configuration
```

## Database Integration

This starter includes modern database integration:

- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** as the database provider
- **Better Auth** integration with Drizzle adapter
- **Database migrations** with Drizzle Kit

## Development Commands

### Application
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:up` - Start PostgreSQL in Docker
- `npm run db:down` - Stop PostgreSQL container
- `npm run db:dev` - Start development PostgreSQL (port 5433)
- `npm run db:dev-down` - Stop development PostgreSQL
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Drizzle migration files
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:reset` - Reset database (drop all tables and recreate)

### Styling with shadcn/ui
- Pre-configured with 40+ shadcn/ui components in New York style
- Components are fully customizable and use CSS variables for theming
- Automatic dark mode support with next-themes integration
- Add new components: `npx shadcn@latest add [component-name]`

### Docker
- `npm run docker:build` - Build application Docker image
- `npm run docker:up` - Start full application stack (app + database)
- `npm run docker:down` - Stop all containers
- `npm run docker:logs` - View container logs
- `npm run docker:clean` - Stop containers and clean up volumes

## Docker Development

### Quick Start with Docker
```bash
# Start the entire stack (recommended for new users)
npm run docker:up

# View logs
npm run docker:logs

# Stop everything
npm run docker:down
```

### Development Workflow
```bash
# Option 1: Database only (develop app locally)
npm run db:up          # Start PostgreSQL
npm run dev            # Start Next.js development server

# Option 2: Full Docker stack
npm run docker:up      # Start both app and database
```

### Docker Services

The `docker-compose.yml` includes:

- **postgres**: Main PostgreSQL database (port 5432)
- **postgres-dev**: Development database (port 5433) - use `--profile dev`
- **app**: Next.js application container (port 3000)

### Docker Profiles

```bash
# Start development database on port 5433
docker-compose --profile dev up postgres-dev -d

# Or use the npm script
npm run db:dev
```

## Deployment

### Production Deployment

#### Option 1: Docker Compose (VPS/Server)

1. **Clone and setup on your server:**
   ```bash
   git clone <your-repo>
   cd codeguide-starter-fullstack
   cp .env.example .env
   ```

2. **Configure environment variables:**
   ```bash
   # Edit .env with production values
   DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/postgres
   POSTGRES_DB=postgres
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password
   BETTER_AUTH_SECRET=your-very-secure-secret-key
   BETTER_AUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
   ```

3. **Deploy:**
   ```bash
   npm run docker:up
   ```

#### Option 2: Container Registry (AWS/GCP/Azure)

1. **Build and push image:**
   ```bash
   # Build the image
   docker build -t your-registry/codeguide-starter-fullstack:latest .
   
   # Push to registry
   docker push your-registry/codeguide-starter-fullstack:latest
   ```

2. **Deploy using your cloud provider's container service**

#### Option 3: Vercel + External Database

1. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Add environment variables in Vercel dashboard:**
   - `DATABASE_URL`: Your managed PostgreSQL connection string
   - `BETTER_AUTH_SECRET`: Generate a secure secret
   - `BETTER_AUTH_URL`: Your Vercel deployment URL

3. **Setup database:**
   ```bash
   # Push schema to your managed database
   npm run db:push
   ```

### Environment Variables for Production

```env
# Required for production
DATABASE_URL=postgresql://user:password@host:port/database
BETTER_AUTH_SECRET=generate-a-very-secure-32-character-key
BETTER_AUTH_URL=https://yourdomain.com

# Optional optimizations
NODE_ENV=production
```

### Production Considerations

- **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- **Security**: Generate strong secrets, use HTTPS
- **Performance**: Enable Next.js output: 'standalone' for smaller containers
- **Monitoring**: Add logging and health checks
- **Backup**: Regular database backups
- **SSL**: Terminate SSL at load balancer or reverse proxy

### Health Checks

The application includes basic health checks. You can extend them:

```dockerfile
# In Dockerfile, add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

## AI Coding Agent Integration

This starter is optimized for AI coding agents:

- **Clear file structure** and naming conventions
- **TypeScript integration** with proper type definitions
- **Modern authentication** patterns
- **Database schema** examples

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# codeguide-starter-fullstack
