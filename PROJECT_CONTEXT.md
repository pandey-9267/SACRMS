# SACRMS Project Context

This document is the working reference for developers and AI assistants modifying this repository. It describes the implementation that exists in the repository, not an idealized production design.

## 1. Project identity

**SACRMS** means **Smart Army Camp Resource Management System**.

SACRMS is a React/Vite operations dashboard backed by an Express/Mongoose API. It models a headquarters and multiple military camps that manage:

- camp readiness and camp settings;
- resource inventory and stock levels;
- consumption records;
- equipment and maintenance work;
- operational alerts;
- inter-camp supply requests;
- reports and user/camp administration;
- authenticated API access and audit logging.

The UI is a dark, military-style dashboard with two themes (`plain` and `army`). The application is designed as a portfolio/demo system and is not a certified military or safety-critical platform.

## 2. Repository layout

```text
.
├── frontend/
│   ├── index.html
│   ├── metadata.json
│   ├── vite.config.ts
│   ├── .env.development
│   ├── .env.production
│   ├── assets/phot.jpeg
│   ├── public/assets/phot.jpeg
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── types/index.ts
│       ├── data/mockData.ts
│       ├── context/AppContext.tsx
│       └── components/
├── server/
│   ├── index.ts
│   ├── seed.ts
│   ├── config/db.ts
│   ├── middleware/auth.ts
│   ├── models/models.ts
│   └── .env.example
├── uploads/camps/
├── package.json
├── tsconfig.json
├── README.md
└── PROJECT_CONTEXT.md
```

`node_modules/` and generated build output are not source files. Do not edit them.

## 3. Technology and runtime

| Area | Implementation |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 through `@tailwindcss/vite`, custom CSS |
| Icons/fonts | Material Symbols, Barlow, Barlow Condensed, JetBrains Mono |
| Frontend state | `AppContext` and React hooks |
| API | Node.js, Express 5, TypeScript executed with `tsx` |
| Database | MongoDB through Mongoose 9 |
| Authentication | bcrypt password hashes plus JWT bearer tokens |
| Uploads | Multer disk storage under `uploads/camps/` |
| API proxy | Vite proxies `/api` to `http://localhost:4000` |
| Production API URL | `https://sacrms.onrender.com/api` in `frontend/.env.production` |

The package is an ES module package (`"type": "module"`). The root TypeScript configuration includes both frontend and server files and uses `noEmit`.

## 4. Commands

Run these from the repository root:

```bash
npm install
npm run dev          # Vite development server, port 3000
npm run server       # Express API, port 4000
npm run server:seed  # Destructive database seed; deletes selected collections first
npm run lint         # tsc --noEmit
npm run build        # Vite production build
npm run preview      # Preview the frontend build
npm run clean        # Removes dist/
```

For local development, run the frontend and server in separate terminals:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:4000
Health:   http://localhost:4000/api/health
```

The frontend requires the backend to be reachable. `AppContext` polls `/api/health` every five seconds and exposes `backendAvailable`. Login is blocked while the backend is offline.

## 5. Environment configuration

### Frontend

`frontend/.env.development` currently contains:

```text
VITE_API_URL=http://localhost:4000/api
```

`frontend/.env.production` currently contains:

```text
VITE_API_URL=https://sacrms.onrender.com/api
```

`VITE_API_URL` must point to the API base path ending in `/api`. `AppContext` derives the API origin from this value to resolve uploaded image paths.

### Server

Copy `server/.env.example` to a server `.env` file and provide real values:

```text
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-secret>
CLIENT_ORIGIN=http://localhost:3000
```

Never commit `.env`, database credentials, JWT secrets, real personnel data, or real operational data. The code currently falls back to `development-secret` when `JWT_SECRET` is absent; this fallback is for development only and must be removed or blocked in production.

## 6. Application startup and data flow

1. `frontend/src/main.tsx` mounts `App` inside `StrictMode`.
2. `App.tsx` wraps the UI in `AppProvider`.
3. `AppContext.tsx` owns authentication, API calls, state, permissions, and mutations.
4. The backend connection check calls `GET /api/health`.
5. After a successful login, the context stores the JWT and user in `sessionStorage`.
6. When authenticated and online, the context loads camps, resources, consumption, requests, equipment, and maintenance records from the API.
7. UI actions call the API and update local React state after successful responses.
8. The root app selects the active dashboard view and renders the global HQ pending-request modal and toast container.

The exported `apiRequest<T>()` helper:

- reads `sacrms_token` from `sessionStorage`;
- sends `Authorization: Bearer <token>`;
- sets JSON content type unless the body is `FormData`;
- parses JSON responses;
- throws an `Error` using the API `message` when the response is not successful.

## 7. Frontend navigation and screens

`ActiveView` is defined in `frontend/src/context/AppContext.tsx`:

| View | Component | Main responsibility |
|---|---|---|
| `dashboard` | `DashboardView.tsx` | Operational readiness overview, KPIs, stock and alerts |
| `camps` | `CampsView.tsx` | Camp list, camp profile, create/delete and settings |
| `resources` | `ResourceInventoryView.tsx` | Inventory search, filtering, stock actions and CSV export |
| `consumption` | `ConsumptionView.tsx` | Consumption history, recording and analytics |
| `equipment` | `EquipmentView.tsx` | Equipment assets, status and health |
| `maintenance` | `MaintenanceView.tsx` | Maintenance tasks and work-order status |
| `alerts` | `AlertsView.tsx` | Alerts, acknowledgement and resupply actions |
| `reports` | `ReportsView.tsx` | Operational summaries and report views |
| `users` | `UsersView.tsx` | Active user/camp profile administration display |
| `settings` | `SettingsView.tsx` | Theme and camp-specific settings |
| `requests` | `SupplyRequestsView.tsx` | Camp requests and HQ request queue |

Shared layout:

- `Sidebar.tsx`: role-filtered navigation and alert count.
- `TopHeader.tsx`: camp selection, notifications, theme, profile and shortcuts.
- `App.tsx`: view routing, persisted active view, authentication gate and global overlays.

Shared modals:

| File | Purpose |
|---|---|
| `AddResourceModal.tsx` | Add inventory |
| `QuickRestockModal.tsx` | Increase resource stock |
| `AddEquipmentModal.tsx` | Add equipment |
| `RecordConsumptionModal.tsx` | Record resource consumption |
| `ResupplyDispatchModal.tsx` | Resupply/dispatch flow |
| `AppsDrawer.tsx` | Application shortcut drawer |
| `HelpModal.tsx` | Help content |
| `ToastContainer.tsx` | Success, warning, error and info notifications |

## 8. Roles and frontend permissions

The role-to-view map is defined in `AppContext.tsx`:

| Role | Accessible views |
|---|---|
| `Admin` | All views |
| `Logistics` | Dashboard, resources, consumption, equipment, maintenance, alerts, reports, settings, requests |
| `Maintenance` | Dashboard, camps, equipment, maintenance, alerts, reports |
| `Maintenance Supervisor` | Dashboard, camps, equipment, maintenance, alerts, reports |
| `Commander` | Dashboard, camps, alerts, reports |

The backend user schema currently allows `Admin`, `Logistics`, `Maintenance`, and `Maintenance Supervisor`. `Commander` exists in the frontend type/permission model but is not accepted by the current Mongoose user schema.

Frontend visibility is not a security boundary. Every protected backend route must continue to enforce authentication, role, and camp scope on the server.

## 9. Authentication and demo identities

The real login path is `POST /api/auth/login`. Successful login returns an eight-hour JWT and a user profile. The token is stored as `sacrms_token` in `sessionStorage`; the profile is stored as `sacrms_user`.

### Seeded database identity

The current `server/seed.ts` deletes users, resources, consumption records, and camps, then creates only this user:

| Role | Email | Password | Camp |
|---|---|---|---|
| HQ Admin | `commander@logistics.node` | `SACRMS-ADMIN` | `null` in the current seed |

The current seed script does **not** create camps, logistics users, equipment, maintenance tasks, supply requests, or audit logs.

### Camp-created logistics identity

When an Admin creates a camp through `POST /api/camps`, the backend creates a Logistics leader. The frontend derives the email as:

```text
logistics.lead@<normalized-camp-name>.mil
```

The backend generates a temporary password and returns it to the Admin. The exact password is not fixed in source code. The UI may display it once for the Admin.

Therefore, values such as `logistics.lead@camp-alpha.mil` are valid only if a Camp Alpha profile has actually been created in the connected database. They are not created by the current seed script.

## 10. Shared frontend data models

The canonical UI types are in `frontend/src/types/index.ts`.

### Camp

`Camp` contains:

```text
id, name, type, code, personnel, readinessScore, location,
commander, status, weather, temperature, profileImage,
warningThreshold, criticalThreshold, autoAlerts
```

Camp types are `Live`, `Reserve`, and `Forward Base`. Camp status is `Optimal`, `Warning`, or `Standby`.

### Resource

`ResourceItem` contains:

```text
id, name, category, currentStock, unit, minLevel, maxCapacity,
burnRatePerPersonPerDay, estDays, status, campId, icon,
lastRestocked, location, sku
```

Resource categories are `Water`, `Fuel`, `Food`, `Medicine`, `Supplies`, `Ammunition`, and `Power`.

### Supply request

`SupplyRequest` contains:

```text
id, campId, campName, category, resourceName, quantity, unit,
urgency, reason, status, requestedBy, createdAt, auditLog
```

Optional fields include `reviewedBy`, `rejectionReason`, `carrier`, `eta`, `receivedAt`, `sourceCampId`, and `sourceResourceId`.

Request statuses are:

```text
Submitted -> Approved -> In Transit -> Received
Submitted -> Rejected
Approved  -> Rejected
```

## 11. Inventory and consumption rules

The frontend calculates resource status from stock and capacity:

- `Critical`: at/below the minimum level or at/below the critical capacity threshold;
- `Warning`: at/below the warning capacity threshold;
- `Healthy`: otherwise.

Estimated runway is approximately:

```text
current stock / (burn rate per person per day * camp personnel)
```

Any stock mutation must keep `currentStock`, `status`, and `estDays` consistent. Stock must not become negative or exceed `maxCapacity` unless the business rule explicitly permits it.

Consumption records contain camp, resource name/category, date, quantity, headcount, purpose, unit, and recording user. The API validates non-negative quantity and headcount.

## 12. Supply-request workflow

### Frontend behavior

The intended workflow is:

```text
Camp Logistics submits request
        -> Admin approves or rejects
        -> Admin dispatches
        -> Camp Logistics confirms receipt
```

The HQ pending-request overlay is rendered by `App.tsx` for Admin users when `pendingCampRequests` contains an unresolved request. Review navigates to the Requests view; it does not itself resolve the request.

### Backend transition rules

`PATCH /api/requests/:id/status` permits:

| Current status | Next status | Role |
|---|---|---|
| `Submitted` | `Approved` | Admin |
| `Submitted` | `Rejected` | Admin |
| `Approved` | `In Transit` | Admin |
| `In Transit` | `Received` | Logistics user belonging to the request camp |

Dispatch stores carrier and ETA. Receipt looks up the destination resource by request camp, resource ID, and resource name, adds the quantity capped at `maxCapacity`, stores `receivedAt`, and writes audit entries.

### Important implementation distinction

The current backend intentionally does **not** deduct stock during Admin dispatch. The source comments explain that the database has camp resources but no separate HQ warehouse. The backend adds destination stock only when the request is received.

The frontend contains a richer source-resource dispatch concept in parts of `AppContext.tsx` and the demo workflow. Do not assume those two implementations are equivalent. Any future inventory-transfer change must be designed and tested across both layers, ideally by introducing an explicit HQ warehouse/source inventory model.

## 13. Backend API

All routes are under `/api`. Protected routes require a JWT. Role restrictions below are enforced by `requireRole`.

### Health and authentication

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Returns `{ status: "ok", service: "SACRMS API" }` |
| POST | `/auth/login` | Public | Verifies email/password and returns JWT/user |

### Camps

| Method | Route | Auth/role | Purpose |
|---|---|---|---|
| POST | `/camps` | Admin + multipart | Creates camp, uploads optional profile image, creates Logistics leader |
| GET | `/camps` | Authenticated | Admin sees all; other users see assigned camp |
| PATCH | `/camps/:id/settings` | Authenticated | Admin edits any camp; Logistics edits own camp settings |
| DELETE | `/camps/:id` | Admin | Deletes camp and related users/resources/records/equipment/tasks/requests |

Camp deletion also removes locally stored uploaded profile images when the path is under the SACRMS uploads directory.

### Resources

| Method | Route | Auth/role | Purpose |
|---|---|---|---|
| GET | `/resources?campId=...` | Authenticated | Reads a camp's resources; Admin supplies camp ID |
| POST | `/resources` | Admin or Logistics | Creates a resource in the permitted camp |
| PATCH | `/resources/:id` | Admin or Logistics | Updates a resource after camp-scope validation |
| DELETE | `/resources/:id` | Admin or Logistics | Deletes a resource after camp-scope validation |

If a camp has no resources, `GET /resources` creates starter resources for that camp.

### Consumption

| Method | Route | Auth/role | Purpose |
|---|---|---|---|
| GET | `/consumption?campId=...` | Authenticated | Reads consumption for an allowed camp |
| POST | `/consumption` | Admin or Logistics | Creates a validated consumption record |

### Supply requests

| Method | Route | Auth/role | Purpose |
|---|---|---|---|
| POST | `/requests` | Logistics | Creates a request using a resource belonging to the user's camp |
| GET | `/requests` | Authenticated | Admin sees all; Logistics is filtered to its camp |
| PATCH | `/requests/:id/status` | Authenticated | Applies the allowed approval, rejection, dispatch, or receipt transition |

### Equipment

| Method | Route | Auth/role | Purpose |
|---|---|---|---|
| GET | `/equipment?campId=...` | Authenticated | Reads all or selected-camp equipment |
| POST | `/equipment` | Admin, Logistics, Maintenance, Maintenance Supervisor | Creates equipment in the permitted camp |
| PATCH | `/equipment/:id` | Admin, Maintenance, Maintenance Supervisor | Updates equipment after scope validation |

### Maintenance

| Method | Route | Auth/role | Purpose |
|---|---|---|---|
| GET | `/maintenance?campId=...` | Authenticated | Reads maintenance tasks |
| POST | `/maintenance` | Admin, Logistics, Maintenance, Maintenance Supervisor | Creates a task |
| PATCH | `/maintenance/:id` | Admin, Logistics, Maintenance, Maintenance Supervisor | Updates a task after scope validation |

## 14. MongoDB models

All schemas are in `server/models/models.ts`.

| Model | Important fields |
|---|---|
| `User` | name, email, passwordHash, role, campId, rank, serviceId |
| `Camp` | name, type, code, personnel, location, commander, profileImage, weather, temperature, status, thresholds, alert settings |
| `Resource` | campId, name, SKU, category, stock, unit, min/max levels, burn rate, location |
| `Consumption` | campId, resourceName, category, date, quantity, headcount, purpose, unit, recordedBy |
| `SupplyRequest` | campId, requestedBy, resourceId, resourceName, category, quantity, unit, urgency, reason, status, carrier, ETA, receipt/rejection fields |
| `Equipment` | campId, name, serialNumber, category, model, status, healthScore, operatingHours, location, maintenance dates |
| `MaintenanceTask` | campId, equipmentId, title, priority, status, assignedTo, dueDate, description |
| `AuditLog` | actorId, action, entityType, entityId, details |

All schemas use Mongoose timestamps. Object references use `Camp`, `User`, `Resource`, and `Equipment` refs as defined in the schema.

## 15. Authorization and audit behavior

`server/middleware/auth.ts`:

1. reads the bearer token from `Authorization`;
2. verifies it with `JWT_SECRET`;
3. loads the user from MongoDB;
4. attaches `{ id, role, campId }` to `req.user`;
5. returns `401` for missing, invalid, expired, or deleted-user sessions.

`requireRole()` returns `403` when the authenticated user's role is not allowed.

The `audit()` helper records actor, action, entity type, entity ID, and optional details. Important actions include camp/resource/equipment/maintenance creation and updates, consumption recording, request approval/rejection/dispatch/receipt, and camp settings changes.

## 16. Client persistence

Server data is the primary source when the API is available. Browser storage currently supports session/UI behavior:

| Storage | Key | Purpose |
|---|---|---|
| `sessionStorage` | `sacrms_token` | JWT |
| `sessionStorage` | `sacrms_user` | Last authenticated profile for the active browser session |
| `localStorage` | `sacrms_theme` | `plain` or `army` theme |
| `localStorage` | `sacrms_selected_camp` | Admin's selected camp |
| `localStorage` | `sacrms-active-view` | Last active navigation view |
| `localStorage` | `sacrms_pending_requests` | Pending-request overlay queue used by the frontend |
| `localStorage` | `sacrms_acknowledged_alerts_<userId>` | Per-user alert acknowledgement IDs |

`resetAllData()` clears frontend state and legacy/demo storage keys. It does not delete MongoDB records. Database deletion must be performed through the API or database tooling.

## 17. Current data and deployment caveats

- `frontend/src/data/mockData.ts` is now mostly empty and contains only an Admin demo profile; it is not a complete production seed.
- `server/seed.ts` is destructive for `User`, `Resource`, `Consumption`, and `Camp` collections. It does not clear every model and creates only the HQ Admin.
- The current Admin seed has `campId: null`. Admin endpoints can select camps through query parameters or the UI once camps exist.
- The backend has no separate HQ warehouse entity. Dispatch therefore authorizes shipment but does not deduct source stock.
- The frontend and backend are not yet a single fully consistent implementation of dispatch/source inventory.
- `SupplyRequest`, `Equipment`, and other Mongoose models are created without explicit TypeScript document interfaces. Preserve current behavior carefully when improving typing.
- Browser prompts remain in parts of the UI for rejection reason, carrier, or ETA; accessible React modals would be better.
- There is no automated unit, integration, or end-to-end test suite in the repository.
- There is no transaction protecting multi-document stock/request changes.
- The API accepts several free-form strings and uses limited request validation. Production validation should be strengthened.
- There is no refresh-token/revocation workflow; the JWT lifetime is eight hours.
- Local uploads are not a durable object-storage solution for deployment.
- MongoDB connection, CORS, and error handling need production hardening before real operational use.

## 18. Recommended implementation priorities

1. Add a distinct HQ warehouse/depot and warehouse inventory model.
2. Make frontend and backend supply-request stock movement use the same transaction and rules.
3. Add explicit TypeScript interfaces for Mongoose documents and API DTOs.
4. Add schema validation for every API body, preferably with a shared validation library.
5. Add MongoDB transactions for dispatch, receipt, and related stock mutations.
6. Replace browser prompts with accessible, validated React modals.
7. Add request timeline/history and an audit-log view.
8. Add automated tests for auth, camp isolation, role permissions, inventory boundaries, and every request transition.
9. Add seed data for camps, logistics users, resources, equipment, maintenance, and realistic demo requests.
10. Add pagination, indexes, rate limiting, structured logging, secure headers, and production secret enforcement.
11. Add upload type/size validation, persistent storage, and safer file naming/deletion.
12. Add an API client layer or query library if the number of server-backed screens grows.

## 19. Guidance for AI assistants

Before editing:

1. Read this file and `README.md`.
2. Read `frontend/src/types/index.ts`.
3. Read the relevant component and `frontend/src/context/AppContext.tsx`.
4. For API work, read `server/index.ts`, `server/middleware/auth.ts`, and `server/models/models.ts`.
5. Check whether the behavior is frontend-only, backend-only, or an integration behavior.

When changing behavior:

- Preserve camp isolation for non-Admin users.
- Repeat authorization checks on the server; never rely on hidden navigation.
- Keep resource stock, status, and runway calculations synchronized.
- Keep request status transitions explicit and reject invalid transitions.
- Do not claim that the UI is server-persistent if the changed path still uses local state.
- Do not assume fixed logistics credentials; camp creation generates the leader password.
- Do not use real military, student, or personnel data in fixtures or screenshots.
- Avoid changing storage keys without a migration or compatibility plan.
- Surface API failures to the user through the existing toast/error pattern.
- Keep API and frontend DTO changes synchronized.

After code changes:

```bash
npm run lint
npm run build
```

For request or authentication changes, also run the server against a safe development database and manually verify:

```text
health -> login -> camp scope -> resource read/write -> request transition -> audit record
```

## 20. Suggested demonstration flow

For a product demo or animated video, use fake data and show:

1. Admin login.
2. Camp overview and readiness dashboard.
3. Resource inventory with warning/critical stock.
4. Camp Logistics login and scoped inventory.
5. Consumption entry and updated analytics.
6. Supply request submission.
7. Admin approval and dispatch.
8. Camp receipt confirmation.
9. Equipment and maintenance status.
10. Alerts, reports, settings, and audit history.

Explain the architecture accurately:

```text
React/Vite UI
      -> Express API
      -> JWT authentication and role/camp authorization
      -> Mongoose models
      -> MongoDB
      -> AuditLog records
```

Do not present the current system as having live GPS, real carrier integration, a separate HQ warehouse, or production-grade military security; those are future capabilities unless implemented explicitly.
