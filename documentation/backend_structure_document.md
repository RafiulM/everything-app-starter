# Backend Structure Document

## 1. Backend Architecture

This project uses a modern, full-stack approach built on Next.js with a focus on server-side logic and streaming. The backend is organized to be scalable, maintainable, and high-performing.

- **Framework**: Next.js (App Router) with Server Components and Route Handlers
- **Language**: TypeScript for type safety and clear contracts
- **Design Patterns**: 
  - Feature-sliced modules: each feature (auth, chat, attachments) lives in its own folder
  - Layered architecture: 
    1. Route handlers (API layer)  
    2. Business logic (services in `/lib`)  
    3. Data layer (Drizzle ORM schemas in `/db/schema`)
    4. UI layer (React Server Components in `/app`)

How it supports:
- **Scalability**: Serverless Route Handlers or containerized services can be scaled independently. Database connections are pooled via Drizzle.
- **Maintainability**: Clear separation of concerns; adding new features means adding new routes, schemas, and services without touching core code.
- **Performance**: Server Components and streaming responses reduce client bundle size and allow real-time updates for chat. Docker ensures consistent environments.

## 2. Database Management

- **Type**: Relational (SQL)
- **System**: PostgreSQL
- **ORM**: Drizzle ORM (type-safe query builder with migrations support)

Data practices:
- **Schemas** defined in `/db/schema` using Drizzle. Tables include users, sessions, chats, messages, attachments.
- **Migrations** are managed via Drizzle CLI, ensuring consistent schema changes across environments.
- **Connection pooling** configured via environment variables for production performance.

## 3. Database Schema

Below is an SQL-style representation of the PostgreSQL schema. It is stored and managed by Drizzle ORM.

```sql
-- Users table (already defined by auth)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat sessions (group conversations)
CREATE TABLE chats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Messages within a chat
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender TEXT CHECK (sender IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- File attachments (for multi-modal interactions)
CREATE TABLE attachments (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 4. API Design and Endpoints

The backend uses RESTful endpoints via Next.js Route Handlers.

### Authentication
- **POST /api/auth/sign-in**: User sign-in, returns session token
- **POST /api/auth/sign-up**: Create new user
- **POST /api/auth/sign-out**: Invalidate session

### Chat
- **GET /api/chat/sessions**: List all chat sessions for the authenticated user
- **POST /api/chat/sessions**: Create a new chat session, returns chat ID
- **GET /api/chat/sessions/[chatId]/messages**: Fetch all messages in a session
- **POST /api/chat/sessions/[chatId]/messages**: Send user message, triggers AI stream, returns assistant reply as stream

### Attachments
- **POST /api/chat/attachments**: Upload a file, secured endpoint storing to S3 or Vercel Blob, returns file URL

Each route handler:
- Validates input (using Zod)
- Verifies user session (Better Auth)
- Calls service functions in `/lib` to handle business logic
- Interacts with the database via Drizzle ORM

## 5. Hosting Solutions

- **Preferred Cloud Provider**: Vercel (native Next.js support)
- **Alternative**: Dockerized containers on AWS ECS / AWS App Runner or DigitalOcean

Benefits:
- **Reliability**: Vercel auto-scales serverless functions. Docker on AWS uses managed services with high uptime SLAs.
- **Scalability**: Serverless Route Handlers scale with requests. Containers can be scaled by CPU/memory.
- **Cost-Effectiveness**: Pay-as-you-go on Vercel. Docker hosting with reserved capacity for predictable workloads.

## 6. Infrastructure Components

- **Load Balancer**: Provided by Vercel or AWS ALB to distribute HTTP traffic
- **Content Delivery Network (CDN)**: Vercel’s global edge network caches static assets (CSS, JS) for fast delivery
- **Database Pool**: PgBouncer or built-in pooling to maintain persistent connections and reduce latency
- **File Storage**: Vercel Blob or AWS S3 for storing user attachments and generated images
- **Docker**: Standardized containers defined by Dockerfile and Docker Compose for local and production environments

These components work together to ensure low latency, high throughput, and a consistent developer experience.

## 7. Security Measures

- **Authentication**: Better Auth library handling secure session cookies and JWTs
- **Authorization**: Every API route verifies the user session and enforces ownership (e.g., chat sessions belong to the requesting user)
- **Data Encryption**: 
  - In transit: HTTPS/TLS for all requests
  - At rest: Managed disk encryption on cloud provider, encrypted database credentials in environment variables
- **Input Validation**: Zod schemas for incoming payloads to prevent injection and malformed data
- **Secrets Management**: Environment variables stored in secure vaults (Vercel Secrets or AWS Secrets Manager)
- **CORS Policy**: Strictly limited to the frontend domain

## 8. Monitoring and Maintenance

- **Logging**: 
  - Next.js built-in logs for route handlers
  - Structured logs sent to a service like Logflare or Datadog
- **Error Tracking**: Sentry integration to capture runtime exceptions
- **Performance Monitoring**: Vercel Analytics or an APM like New Relic for database and API latency
- **Health Checks**: Automated ping endpoints and uptime monitors (e.g., UptimeRobot)
- **Maintenance Strategy**:
  - Regular Drizzle migrations applied via CI/CD
  - Dependency updates and security audits via GitHub Dependabot
  - Scheduled backups of the PostgreSQL database

## 9. Conclusion and Overall Backend Summary

This backend is a solid foundation for the "everything-app" AI super app:
- A **scalable architecture** built on Next.js with server-side components and streaming streaming responses.
- A **robust PostgreSQL database** managed by Drizzle ORM, supporting chat sessions, messages, and attachments.
- **Clear API design** with RESTful endpoints that handle AI streaming, authentication, and file uploads.
- **Modern hosting** on Vercel or Dockerized services, ensuring reliability and cost control.
- **Essential infrastructure** like load balancers, a CDN, and file storage for fast, global access.
- **Comprehensive security** including auth, validation, encryption, and secrets management.
- **Monitoring and maintenance** tools to keep the system healthy and evolve safely.

Overall, each component aligns with project goals: empowering developers to focus on AI feature development while relying on a well-architected, secure, and maintainable backend.