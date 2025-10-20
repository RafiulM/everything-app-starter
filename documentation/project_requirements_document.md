# Project Requirements Document for "everything-app-starter"

## 1. Project Overview

"everything-app-starter" is a full-stack web application boilerplate built on Next.js. Its goal is to provide developers with a complete, ready-to-use foundation that covers common needs—authentication, database integration, theming, UI components, and deployment configurations—so they can focus on adding advanced AI features like Chat, Search, and Image Generation. By bundling these best practices and core modules, the starter kit dramatically reduces setup time and ensures consistency across projects.

The boilerplate is being built to support the development of an "everything-app" AI super-app, which will deliver multi-modal AI experiences to authenticated users. The key objectives are:

- Enable secure user management and personalized data storage.
- Provide a polished, themable UI shell that can host dynamic AI interfaces.
- Offer a server-ready architecture for streaming AI model responses.
- Simplify local and production deployment via Docker.

Success will be measured by how quickly developers can spin up the starter, integrate an AI model using `@ai-sdk`, and deploy an interactive AI chat or search interface.

---

## 2. In-Scope vs. Out-of-Scope

### In-Scope (First Version)
- **User Authentication:** Sign-up, sign-in, sign-out flows using Better Auth.  
- **Database Integration:** PostgreSQL configured with Drizzle ORM for storing users, chat sessions, and related metadata.  
- **UI Shell & Theming:** Tailwind CSS, `shadcn/ui` components, and `next-themes` for light/dark mode.  
- **Dashboard Layout:** A basic dashboard page with sidebar navigation and main content area.  
- **AI Chat Scaffold:**  
  - Frontend chat page at `/app/chat/page.tsx` using `assistant-ui`.  
  - Backend API route at `/app/api/chat/route.ts` to stream model responses via `@ai-sdk`.  
- **Docker Setup:** `Dockerfile` and `docker-compose.yml` for local dev and production deployment.  

### Out-of-Scope (Planned for Later Phases)
- File upload and multi-modal attachment handling.  
- Fully developed AI Search and Image Generation frontends.  
- Advanced state management beyond simple React context (e.g., global model selector with Zustand).  
- CI/CD pipelines and testing framework configurations (beyond basic code structure).  
- Third-party storage integrations (AWS S3, Cloudinary) for assets.  

---

## 3. User Flow

When a new user visits the app, they land on the sign-in page. They can create an account via email and password or sign in if they already have credentials. Upon successful authentication, they are redirected to the dashboard. The left sidebar presents navigation options—Chat, Search, Image Gen—and the main content area welcomes them with an overview or prompts to start a conversation.

If the user clicks "Chat," they see the chat interface rendered by `assistant-ui`. They type a prompt into the input field and hit send. Under the hood, the message goes to `/app/api/chat/route.ts`, which validates the session, forwards the prompt to an AI model using `@ai-sdk`, and streams the response back. The UI displays each chunk in real time. Once the message exchange is complete, the conversation is saved to the PostgreSQL database, and the user can continue the chat or navigate to other features.

---

## 4. Core Features

- **Authentication Module**  
  - Sign-up, sign-in, sign-out flows using Better Auth.  
  - Session handling and protected routes for AI features.
- **Database Layer**  
  - Drizzle ORM schemas for `users`, `chats`, `messages`.  
  - Migration support and type-safe queries.
- **Dashboard & Routing**  
  - Next.js App Router with Server Components.  
  - Sidebar navigation and main content area template.
- **UI & Theming**  
  - Tailwind CSS v4 and `next-themes` for light/dark mode.  
  - `shadcn/ui` component library for consistent styling.
- **AI Chat Integration**  
  - Frontend chat page using `assistant-ui` components.  
  - API route with session check, input validation (Zod), and streaming via `@ai-sdk`.
- **Docker & Deployment**  
  - `Dockerfile` for building the Next.js app.  
  - `docker-compose.yml` to stand up the app and PostgreSQL locally.

---

## 5. Tech Stack & Tools

- **Frontend Framework:** Next.js (App Router) with Server Components  
- **Language:** TypeScript  
- **Authentication:** Better Auth  
- **Database:** PostgreSQL  
- **ORM:** Drizzle ORM  
- **Styling:** Tailwind CSS v4, `next-themes`  
- **UI Components:** `shadcn/ui`, `assistant-ui` (for AI chat)  
- **AI SDK:** Vercel’s `@ai-sdk` for streaming model responses  
- **Validation:** Zod (for request schemas)  
- **Containerization:** Docker, Docker Compose  
- **Potential IDE Plugins:** Cursor (AI coding assistant), Windsurf (Next.js productivity)

---

## 6. Non-Functional Requirements

- **Performance:**  
  - Initial page load under 1 second.  
  - AI streaming responses render each chunk within 100ms of arrival.  
- **Security:**  
  - All AI endpoints require valid user sessions.  
  - Input validation via Zod to prevent injection attacks.  
- **Usability:**  
  - Accessible design (ARIA roles, keyboard nav).  
  - Theme toggle easily reachable.  
- **Scalability:**  
  - Database connections pooled for concurrent chat sessions.  
  - Dockerized services for horizontal scaling.

---

## 7. Constraints & Assumptions

- The environment has access to Vercel’s `@ai-sdk` and required AI model API keys.  
- PostgreSQL is available locally or in the target production environment.  
- Developers will install `assistant-ui` after pulling the starter.  
- Next.js App Router features (Server Components, Route Handlers) are supported by the hosting platform.  
- Better Auth credentials and database credentials are provided via environment variables.

---

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits:**  
  - AI model providers may throttle requests. Mitigation: implement retry logic and backoff.  
- **Streaming Edge Cases:**  
  - Partial or interrupted streams could hang the UI. Mitigation: set timeouts and fallback error messages.  
- **Database Migrations:**  
  - Schema changes can break existing data. Mitigation: use Drizzle’s migration tooling and version control.  
- **CORS or Session Expiry:**  
  - Calls from client to API route might fail if cookies aren’t forwarded. Mitigation: ensure `fetch` uses `credentials: 'include'`.
- **Theme FOUC (Flash of Unstyled Content):**  
  - Initial theme flash if SSR and client theme mismatch. Mitigation: follow `next-themes` recommended _Document_ setup.


---

*This document serves as the definitive reference for building and extending the "everything-app-starter". All future technical specifications—frontend guidelines, backend architecture, file conventions—should align with the details laid out above.*