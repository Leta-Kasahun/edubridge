# Keycloak IAM Integration Guide for EduBridge

This document explains the architecture, configuration, and operation of Keycloak Identity and Access Management (IAM) in EduBridge.

---

## 1. Architecture Overview

EduBridge uses **Keycloak (v26.1)** as an enterprise OpenID Connect (OIDC) / OAuth2 identity provider alongside EduBridge's native authentication system.

```
                          ┌────────────────────────┐
                          │   Next.js 16 Web App   │
                          │   (edubridge-web)      │
                          └──────────┬─────────────┘
                                     │
                 ┌───────────────────┼────────────────────┐
                 │ OIDC Auth / SSO   │ Bearer / API Call  │
                 ▼                   ▼                    ▼
     ┌───────────────────────┐             ┌─────────────────────────┐
     │  Keycloak Server      │             │  Express API            │
     │  (Port 8081)          │             │  (edubridge-api)        │
     │  Realm: edubridge     │             │  Port 5000              │
     └───────────┬───────────┘             └────────────┬────────────┘
                 │                                      │
                 │              JWKS Certs              │
                 │◄─────────────────────────────────────┤
                 │                                      ▼
                 │                          ┌────────────────────────┐
                 │                          │  PostgreSQL (Multi-DB) │
                 └─────────────────────────►│  - edubridge_db        │
                                            │  - edubridge_keycloak  │
                                            └────────────────────────┘
```

### Key Capabilities
1. **Dual-Mode API Authentication**:
   - `apps/api`'s `authenticate` middleware automatically detects token type:
     - **Native EduBridge JWT (HS256)**: Verified with `JWT_SECRET`.
     - **Keycloak Bearer JWT (RS256)**: Verified against Keycloak's JSON Web Key Set (JWKS) endpoint (`/protocol/openid-connect/certs`) using Node.js's native crypto module with automatic key caching and rotation.
   - Extracts identity claims, maps/links user to EduBridge PostgreSQL database, and enforces tenant isolation & RBAC permissions seamlessly.
2. **Web Single Sign-On (SSO)**:
   - Web frontend provides a **"Sign in with Keycloak SSO"** action on the login page alongside Google OAuth.
   - Secure authorization code exchange with PKCE support (`S256`).
   - Automatically synchronizes user sessions in `authStore`.
3. **Database Account Linking**:
   - `User` model includes `keycloakId String? @unique` for deterministic account linking.
   - When a user logs in via Keycloak, their account is matched by `keycloakId`, or by verified `email`/`username`, automatically linking accounts on first login.
4. **Tenant-Scoped Security Policy**:
   - `SecurityPolicy` contains `allowKeycloakAuth Boolean @default(true)`.
   - School administrators can toggle Keycloak SSO on/off per tenant.

---

## 2. Quickstart with Docker Compose

### 2.1 Starting Keycloak
Keycloak is defined in [`docker-compose.yml`](../docker-compose.yml) and imports the pre-configured realm automatically:

```bash
# Start PostgreSQL, Redis, and Keycloak
docker compose up -d postgres redis keycloak
```

Keycloak will be accessible at:
- **Base URL**: `http://localhost:8081`
- **Administration Console**: `http://localhost:8081/admin`
- **Admin Username**: `admin`
- **Admin Password**: `admin`

---

## 3. Pre-Configured Realm: `edubridge`

The realm is imported from [`docker/keycloak/realm-edubridge.json`](../docker/keycloak/realm-edubridge.json) upon container startup.

### 3.1 Clients
| Client ID | Type | Description |
| :--- | :--- | :--- |
| `edubridge-web` | Public | Next.js frontend client with Standard OIDC Flow, PKCE (`S256`), redirecting to `http://localhost:3000/*` |
| `edubridge-api` | Bearer-only | Express API resource server validating JWT Bearer tokens |

### 3.2 Realm Roles
- `SYSTEM_ADMIN`: National and platform administrator
- `SCHOOL_ADMIN`: School administrator
- `TEACHER`: Teacher and curriculum instructor
- `STUDENT`: Enrolled student learner
- `PARENT`: Parent / guardian

### 3.3 Pre-configured Test Accounts
The imported realm contains ready-to-use accounts for local development and testing:

| Email | Username | Password | Role |
| :--- | :--- | :--- | :--- |
| `admin@edubridge.com` | `admin` | `Admin@123` | `SYSTEM_ADMIN` |
| `teacher@edubridge.com` | `teacher` | `Teacher@123` | `TEACHER` |
| `student@edubridge.com` | `student` | `Student@123` | `STUDENT` |

---

## 4. Environment Variables

### Root / Docker (`.env`)
```env
# Keycloak Service
KEYCLOAK_PORT=8081
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin
KEYCLOAK_DB=edubridge_keycloak

# Backend API Keycloak Integration
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=edubridge
KEYCLOAK_CLIENT_ID=edubridge-api
KEYCLOAK_CLIENT_SECRET=
KEYCLOAK_CALLBACK_URL=http://localhost:5000/api/auth/keycloak/callback
KEYCLOAK_FRONTEND_CLIENT_ID=edubridge-web

# Frontend Web Keycloak Integration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=edubridge
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=edubridge-web
```

---

## 5. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/auth/keycloak` | Initiates OIDC authorization flow (redirects browser to Keycloak login page) |
| `GET` | `/api/auth/keycloak/callback` | OIDC redirect URI, exchanges authorization code for tokens and issues EduBridge session |
| `POST` | `/api/auth/keycloak` | Direct token exchange endpoint (accepts `{ token: string }` from external OIDC clients) |
| `ALL` | All Protected Endpoints | Supports Keycloak Bearer tokens (`Authorization: Bearer <token>`) verified via JWKS |

---

## 6. Verification & Testing

1. **Verify Backend Compilation**:
   ```bash
   pnpm --filter api typecheck
   ```
2. **Verify Frontend Compilation**:
   ```bash
   pnpm --filter web typecheck
   ```
3. **Verify Prisma Schema**:
   ```bash
   pnpm db:validate
   ```
