# everything-app-starter Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the everything-app-starter. It’s written in everyday language so that anyone—technical or not—can understand how the frontend is set up and why.

## 1. Frontend Architecture

### 1.1 Overview
- **Framework:** Next.js (App Router) with full support for React Server Components and Route Handlers.  
- **Language:** TypeScript for type safety and clearer code.  
- **UI Library:** shadcn/ui (built on Tailwind CSS) as the base design system.  
- **Styling:** Tailwind CSS v4 (utility-first) with `next-themes` for dark/light mode.  

### 1.2 How It Scales, Stays Maintainable, and Performs
- **Modular File Structure:** folders like `/app`, `/components`, `/lib`, and `/db` let you drop in new features (chat, search, image gen) without tangling existing code.  
- **Server Components & Streaming:** heavy work (like AI calls) runs on the server; only UI updates stream to the client. This keeps the browser bundle small and the app snappy.  
- **TypeScript & Drizzle ORM:** the backend has clear types (via Drizzle) and database models, which reduce runtime bugs when the frontend talks to APIs.

## 2. Design Principles

### 2.1 Key Principles
- **Usability:** intuitive layouts, clear calls to action, minimal clicks to accomplish tasks.  
- **Accessibility:** semantic HTML, ARIA labels, focus management, keyboard navigation, and color contrast that meets WCAG standards.  
- **Responsiveness:** mobile-first design that adapts gracefully across phones, tablets, and desktops.  
- **Consistency:** a unified look & feel powered by shadcn/ui primitives so every screen “feels” part of the same app.

### 2.2 Applying These Principles
- Forms use standard HTML elements with error messages and labels.  
- Buttons and links provide clear hover/focus states.  
- Components collapse or rearrange at breakpoints defined in the Tailwind config (e.g., `sm`, `md`, `lg`).

## 3. Styling and Theming

### 3.1 Styling Approach
- **Tailwind CSS v4**: utility-first, no custom CSS files unless absolutely needed.  
- **CSS Methodology:** pure utility classes—no BEM or SMACSS.  
- **Theme Management:** `next-themes` handles dark/light mode. You can toggle theme in your layout or via a custom switch component.

### 3.2 Visual Style and Theming
- **Overall Style:** modern, flat design with subtle shadows and smooth corners.  
- **Color Palette:** align with Tailwind’s default palette but customized slightly:
  • Primary: `#4F46E5` (indigo-600)
  • Secondary: `#10B981` (green-500)
  • Accent: `#F59E0B` (amber-500)
  • Background (light): `#F3F4F6` (gray-100)
  • Surface (cards, panels): `#FFFFFF`
  • Text (primary): `#111827` (gray-900)
  • Text (secondary): `#6B7280` (gray-500)

- **Font:** Inter (via Tailwind’s default `font-sans`).

## 4. Component Structure

### 4.1 Organization
- `/components/ui/`: reusable, plain-vanilla UI building blocks (buttons, inputs, modals) that follow the design system.  
- `/components/chat/`, `/components/search/`: feature-specific components (e.g., model selector, chat bubble).  
- `/app/chat/page.tsx`, `/app/search/page.tsx`: top-level route components that compose UI from `/components`.

### 4.2 Benefits of Component-Based Architecture
- **Reusability:** build once, use everywhere.  
- **Maintainability:** updates to a core button or input immediately apply across the app.  
- **Clarity:** each component has one job, so it’s easier to test, document, and debug.

## 5. State Management

### 5.1 Local State
- Use React’s built-in `useState` and `useEffect` for ephemeral UI state (e.g., open/closed modals, form inputs).

### 5.2 Global State
- **Zustand** (lightweight) for global concerns, such as the user’s selected AI model or theme preference.  
- Alternatively, React Context can share auth status or user profile data.

### 5.3 Data Fetching and Caching
- **Next.js Server Components** fetch data on the server and render HTML with data preloaded.  
- For client-side data (e.g., live chat history), consider **SWR** or **React Query** for caching, revalidation, and built-in loading/error states.

## 6. Routing and Navigation

### 6.1 File-Based Routing
- All routes live under `/app`: for example, `/app/chat/page.tsx` becomes `/chat` in the browser.  
- Nested layouts in `/app/layout.tsx` let you share navigation bars, sidebars, or footers across pages.

### 6.2 Client-Side Navigation
- Use Next.js `<Link>` for transitions—this prefetches pages and keeps navigation smooth.  
- Protect routes (like `/chat`) by checking authentication status in a client Component or via middleware.

## 7. Performance Optimization

- **React Server Components & Streaming:** offload heavy AI calls to the server; stream partial UI updates for real-time feedback.  
- **Dynamic Imports:** lazy-load large modules or third-party libraries (e.g., UI components for image gen) with `next/dynamic`.  
- **Tailwind Purge:** remove unused CSS in production via the default JIT purge.  
- **Image Optimization:** use Next.js `<Image>` component to automatically serve responsive, optimized images.  
- **Font Optimization:** preload fonts and use `font-display: swap` to avoid rendering delays.

## 8. Testing and Quality Assurance

### 8.1 Unit and Integration Testing
- **Jest** + **React Testing Library** for component and hook tests (e.g., test chat bubble rendering, form validation).  

### 8.2 End-to-End (E2E) Testing
- **Cypress** or **Playwright** for workflows such as logging in, sending a chat message, and verifying it’s saved in the UI.

### 8.3 Linting and Formatting
- **ESLint** with the Next.js and TypeScript plugins to enforce best practices.  
- **Prettier** for consistent code formatting.  
- **TypeScript Strict Mode** enabled to catch type errors early.

### 8.4 Accessibility Checks
- **axe-core** or the **jest-axe** plugin to automatically scan components for common a11y issues.

## 9. Conclusion and Overall Frontend Summary

The everything-app-starter frontend is built with modern best practices in mind: Next.js App Router for seamless routing and streaming, Tailwind CSS and shadcn/ui for a consistent, customizable design system, and TypeScript + Zustand for type-safe state management. This foundation ensures your AI-enabled features—Chat, Search, Image Generation—integrate smoothly, remain maintainable as the codebase grows, and deliver a fast, accessible, and responsive user experience. With clear patterns for styling, component structure, state, routing, performance, and testing, any developer (novice or seasoned) can confidently extend and customize this starter to build a production-ready AI super app.