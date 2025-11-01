# Security Guideline Document for `everything-app-starter`

This document provides security best practices tailored to the **everything-app-starter** codebase. It aligns with core security principles (Security by Design, Least Privilege, Defense in Depth) and covers authentication, data protection, input validation, API security, infrastructure hardening, and dependency management.

---

## 1. Secure Authentication & Access Control

### 1.1 Authentication
- Use the existing **better-auth** integration but enforce a strong password policy:
  - Minimum length: 12 characters
  - At least one uppercase, one lowercase, one digit, and one symbol
  - Password hashing: Argon2id or bcrypt with per-user salts
- Enforce Multi-Factor Authentication (MFA) for sensitive actions (e.g., account changes).
- Secure session management:
  - Use unpredictable session IDs
  - Set cookies with `HttpOnly`, `Secure`, `SameSite=Strict`
  - Enforce idle timeout (e.g., 15 min) and absolute session lifetime (e.g., 8 hrs)
  - Implement server-side logout to invalidate sessions

### 1.2 Authorization & RBAC
- Define clear roles (e.g., _user_, _admin_) and map permissions explicitly.
- On every API route or Server Component, verify the user’s role before executing sensitive operations.
- Never trust client-side role checks—always enforce on the server.

---

## 2. Data Protection & Privacy

### 2.1 Data at Rest & in Transit
- Enforce **TLS 1.2+** for all web and API traffic (HTTPS).
- Encrypt sensitive database fields (e.g., user PII) at the application layer using AES-256.
- Store database credentials and API keys in a secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager), not in `.env` files checked into Git.

### 2.2 Database Security
- Use least‐privileged database roles: separate read/write users from migration/admin users.
- Enable SSL/TLS on the PostgreSQL connection.
- Regularly rotate database credentials.

### 2.3 Logging & Masking
- Avoid logging sensitive fields (passwords, tokens, PII).
- Mask or truncate any user identifiers in logs.
- Store logs in a centralized, access-controlled system (e.g., ELK stack with RBAC).

---

## 3. Input Handling & Validation

### 3.1 Server-Side Validation
- Use **Zod** or a similar schema validation library in every route handler:
  - Validate request bodies, query parameters, and file metadata
  - Reject unexpected fields (strict schema)

### 3.2 Prevent Injection
- Use Drizzle ORM’s parameterized queries—never interpolate raw values.
- For any raw SQL, ensure proper escaping of identifiers and values.

### 3.3 File Uploads
- Validate file types (MIME type allow-list) and maximum sizes.
- Store uploads outside webroot or in a dedicated bucket (e.g., S3) with presigned URLs.
- Scan uploads for malware and enforce rate limits.
- Sanitize filenames and use UUIDs for storage paths to prevent path traversal.

---

## 4. API & Route Security

### 4.1 HTTPS & CORS
- Serve all API endpoints under HTTPS.
- Configure a strict CORS policy:
  - Allow only the official frontend origins
  - Disallow credentials unless required and set `Access-Control-Allow-Credentials` carefully

### 4.2 Rate Limiting & Throttling
- Implement IP‐based and user‐based rate limiting on critical endpoints (e.g., sign-in, `/api/chat`).
- Use libraries like `express-rate-limit` or a reverse‐proxy approach (e.g., NGINX, Vercel Edge Middleware).

### 4.3 CSRF Protection
- Use anti-CSRF tokens (e.g., `next-csrf`) for state-changing requests (POST, PUT, DELETE).
- Verify the `Origin` and `Referer` headers on sensitive routes.

---

## 5. Web Application Security Hygiene

### 5.1 Security Headers
Add and enforce the following headers for all responses:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (or use CSP `frame-ancestors 'none'`)
- `Content-Security-Policy`: restrict sources for scripts, styles, images, fonts
- `Referrer-Policy: no-referrer-when-downgrade`

### 5.2 XSS Mitigation
- Escape and HTML-encode all user-supplied content in React components.
- For any rich text inputs, sanitize on the server with a library like `DOMPurify`.

### 5.3 Subresource Integrity (SRI)
- When loading third-party scripts or styles via CDN, include SRI hashes.

---

## 6. Infrastructure & Containerization

### 6.1 Docker Hardening
- Build images from official, minimal base images (e.g., `node:alpine`).
- Run processes as a non-root user inside the container.
- Scan images for vulnerabilities (e.g., using Trivy) before pushing to registries.
- Use Docker secrets or mounted volume-based secrets to inject environment variables at runtime.

### 6.2 Configuration Management
- Disable debug and stacktrace outputs in production.
- Ensure environment variables (NODE_ENV=production) are set appropriately.
- Close unused ports and disable default Next.js telemetry in production.

### 6.3 TLS/SSL
- Terminate TLS at a trusted load balancer or CDN (e.g., Cloudflare, AWS ALB).
- Use modern cipher suites and disable older protocols (TLS 1.0, 1.1).

---

## 7. Dependency Management & CI/CD

### 7.1 Dependencies
- Maintain `package-lock.json` for deterministic installs.
- Regularly run SCA tools (e.g., Dependabot, Snyk) to detect vulnerable packages.
- Audit and remove unused dependencies to minimize the attack surface.

### 7.2 CI/CD Pipeline
- Integrate automated security checks:
  - Linting and type checks (TS)
  - Unit & integration tests
  - Vulnerability scanning on Docker images and npm dependencies
- Automate deployments with gated approvals for production.

---

## 8. Monitoring, Alerting & Incident Response

- Instrument critical endpoints (auth, file upload, chat API) with structured logging.
- Set up real-time alerts for suspicious patterns (high error rates, repeated failed logins).
- Define an incident response plan to rotate credentials, revoke compromised tokens, and deploy hotfixes.

---

By adhering to these security guidelines, the **everything-app-starter** will provide a robust foundation for building secure, scalable, and maintainable AI-powered web applications.