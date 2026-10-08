# SACRMS

**Smart Army Camp Resource Management System** is a React/Vite operations dashboard with an Express, MongoDB, and Mongoose backend. It models headquarters and multiple camps managing readiness, resources, consumption, equipment, maintenance, alerts, and supply requests.

> **Project status:** This is a portfolio/demo application. It is not a certified military, safety-critical, or production security system. Use fake data for demonstrations and never place real operational, student, personnel, or credential data in this repository.

## Contents

- [What the system does](#what-the-system-does)
- [Features](#features)
- [Architecture](#architecture)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment configuration](#environment-configuration)
- [Running the application](#running-the-application)
- [Authentication and demo users](#authentication-and-demo-users)
- [Using the application](#using-the-application)
- [Roles and permissions](#roles-and-permissions)
- [Supply-request workflow](#supply-request-workflow)
- [API overview](#api-overview)
- [Database models](#database-models)
- [Browser persistence](#browser-persistence)
- [Database seeding and reset](#database-seeding-and-reset)
- [Validation commands](#validation-commands)
- [Known limitations](#known-limitations)
- [Recommended next steps](#recommended-next-steps)

## What the system does

SACRMS is designed to help command and logistics personnel answer:

- What resources are available at each camp?
- Which resources are approaching minimum or critical levels?
- What consumption has been recorded?
- Which equipment needs attention?
- Which maintenance tasks are pending?
- Which camp has submitted a supply requirement?
- Has a requirement been approved, dispatched, or received?
- Which alerts and readiness issues require attention?

The main operational flow is:

```text
Camp Logistics submits a requirement
          ↓
HQ Admin reviews and approves or rejects it
          ↓
HQ Admin dispatches the approved request
          ↓
Requesting Camp Logistics confirms receipt
```

## Features

| Area | Capabilities |
|---|---|
| Dashboard | Readiness overview, camp metrics, resource status, alerts and summaries |
| Camp management | View camps, create camp profiles, create a camp leader, upload profile images and delete camps |
| Resource inventory | Search/filter resources, add, edit, delete, restock, transfer and export inventory data |
| Consumption | Record consumption and review history/analytics |
| Equipment | Track assets, status, health, operating hours and service dates |
| Maintenance | Create and update maintenance tasks/work orders |
| Alerts | View, acknowledge and act on operational alerts |
| Supply requests | Submit, approve, reject, dispatch and receive camp requirements |
| Reports | Review operational summaries |
| Users | Display camp/user access information |
| Settings | Configure theme and camp thresholds/alert preferences |
| UX | Toast notifications, modal workflows, responsive navigation and Plain/Army themes |

## Architecture

```text
React 19 + TypeScript + Vite
              │
              │  /api requests with JWT bearer token
              ▼
Express 5 API
              │
              ├── bcrypt password verification
              ├── JWT authentication and role checks
              ├── camp-scope authorization
              ├── Multer camp-image uploads
              └── audit event creation
              │
              ▼
MongoDB through Mongoose
```

The frontend state, API client, permissions, and server-data loading are centralized in `frontend/src/context/AppContext.tsx`. The backend entry point is `server/index.ts`.

## Technology

| Layer | Technology |
|---|---|
| UI | React 19 |
| Language | TypeScript |
| Build/dev server | Vite |
| Styling | Tailwind CSS v4 and custom CSS |
| Icons/fonts | Material Symbols, Barlow, Barlow Condensed, JetBrains Mono |
| Server | Node.js, Express 5, `tsx` |
| Database | MongoDB, Mongoose 9 |
| Authentication | JWT and bcryptjs |
| File uploads | Multer disk storage |
| Package format | ES modules |

## Project structure

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
│       ├── App.tsx                  # App shell, view routing and global overlays
│       ├── main.tsx                 # React entry point
│       ├── index.css                # Global styles and theme styles
│       ├── context/AppContext.tsx   # State, API client, auth and mutations
│       ├── data/mockData.ts         # Small frontend demo fallback/profile data
│       ├── types/index.ts           # Shared frontend models
│       └── components/
│           ├── alerts/
│           ├── auth/
│           ├── camps/
│           ├── consumption/
│           ├── dashboard/
│           ├── equipment/
│           ├── layout/
│           ├── maintenance/
│           ├── modals/
│           ├── reports/
│           ├── requests/
│           ├── resources/
│           ├── settings/
│           └── users/
├── server/
│   ├── config/db.ts                # MongoDB connection
│   ├── middleware/auth.ts          # JWT authentication and role checks
│   ├── models/models.ts            # Mongoose schemas/models
│   ├── index.ts                    # Express API and route handlers
│   ├── seed.ts                     # Destructive development seed
│   └── .env.example
├── uploads/camps/                  # Local uploaded camp images
├── package.json
├── tsconfig.json
├── README.md
└── PROJECT_CONTEXT.md              # Detailed implementation reference
```

Read [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for the detailed AI/developer reference, including implementation caveats and modification rules.

## Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB database reachable by the server
- A browser with JavaScript enabled

## Installation

Install dependencies from the repository root:

```bash
npm install
```

Do not commit `node_modules/`, `.env` files, database URLs, JWT secrets, or generated build output.

## Environment configuration

### Backend

Copy the example configuration to a server environment file:

```text
server/.env.example -> server/.env
```

Set values similar to:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>
CLIENT_ORIGIN=http://localhost:3000
```

Use a development database containing only fake data. The server currently falls back to `development-secret` when `JWT_SECRET` is missing; this must not be accepted for production.

### Frontend

Development configuration is in `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:4000/api
```

Production configuration is in `frontend/.env.production` and currently points to:

```env
VITE_API_URL=https://sacrms.onrender.com/api
```

Change this value for your own deployment. `VITE_API_URL` must include the `/api` path.

## Running the application

Run the frontend and backend in separate terminals from the repository root:

### Terminal 1: backend

```bash
npm run server
```

The API listens on `http://localhost:4000`.

### Terminal 2: frontend

```bash
npm run dev
```

The Vite application opens at `http://localhost:3000`.

The frontend polls `GET /api/health`. Login and server-backed data require the backend to be reachable. Vite proxies `/api` requests to `http://localhost:4000` during development.

Other commands:

```bash
npm run lint       # TypeScript check for the full repository
npm run build      # Production frontend build
npm run preview    # Preview the production build
npm run clean      # Remove generated dist/ output
npm run server:seed # Reset selected MongoDB collections and create seed admin
```

## Authentication and demo users

Login calls `POST /api/auth/login`. The server:

1. normalizes the email;
2. compares the password with the stored bcrypt hash;
3. returns an eight-hour JWT and user profile;
4. requires that token on protected API requests.

### Demo IDs and passwords

Use these credentials with a database that contains the corresponding accounts:

| Role | Login ID/email | Password | Availability |
|---|---|---|---|
| HQ Admin | `commander@logistics.node` | `SACRMS-ADMIN` | Created by `npm run server:seed` |
| Camp Alpha Logistics | `logistics.lead@camp-alpha.mil` | `SACRMS_CAMP_ALPHA` | Available after Camp Alpha has been created |
| Camp Bravo Logistics | `logistics.lead@camp-bravo.mil` | `SACRMS_CAMP_BRAVO` | Available after Camp Bravo has been created |

The camp credentials use this rule:

```text
Login ID:  logistics.lead@<normalized-camp-name>.mil
Password:  SACRMS_<NORMALIZED_CAMP_NAME>
```

The normalization replaces non-alphanumeric characters with underscores and converts the result to uppercase for the password. For example:

```text
Camp Alpha -> logistics.lead@camp-alpha.mil
Camp Alpha -> SACRMS_CAMP_ALPHA
Camp Bravo -> logistics.lead@camp-bravo.mil
Camp Bravo -> SACRMS_CAMP_BRAVO
```

These are development/demo credentials only. Change this credential-generation design before production use.

### Important seed behavior

The current `server/seed.ts` creates only the HQ Admin. It does not create Camp Alpha, Camp Bravo, or their Logistics users. It also clears the `User`, `Resource`, `Consumption`, and `Camp` collections before inserting the Admin.

Therefore, after running the seed command, use the HQ Admin to create Camp Alpha and Camp Bravo first. The application then creates their Logistics accounts and displays the generated credentials. Do not expect the camp credentials to work immediately after seeding unless those camp users already exist in the database.

## Step-by-step login process

### First-time local setup

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Configure `server/.env` with a reachable MongoDB database, `JWT_SECRET`, and:

   ```env
   CLIENT_ORIGIN=http://localhost:3000
   ```

3. Start the backend in the first terminal:

   ```bash
   npm run server
   ```

4. Start the frontend in a second terminal:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

6. Confirm that the backend is online. The application checks:

   ```text
   http://localhost:4000/api/health
   ```

   If the backend is offline, the login attempt is blocked and the page displays a backend-offline message.

### Login as HQ Admin

1. Open [http://localhost:3000](http://localhost:3000).
2. In **Service ID // Email**, enter:

   ```text
   commander@logistics.node
   ```

3. In **Passcode**, enter:

   ```text
   SACRMS-ADMIN
   ```

4. Click **Authenticate**.
5. After successful authentication, SACRMS stores the JWT for the browser session and opens the dashboard.
6. The Admin can access all views, create camps, view camp data, manage resources, and process supply requests.

### Create Camp Alpha and Camp Bravo accounts

If the camp accounts do not exist:

1. Log in as the HQ Admin.
2. Open **Camps** or **Camp Access**.
3. Create **Camp Alpha** with the required camp details.
4. Save the camp and wait for the credentials result.
5. Record the displayed Camp Alpha email and password:

   ```text
   logistics.lead@camp-alpha.mil
   SACRMS_CAMP_ALPHA
   ```

6. Repeat the process for **Camp Bravo**.
7. The camp users can now log in using their assigned credentials.

The exact account email is derived from the camp name. If the name is different, use the credentials displayed after creation rather than guessing them.

### Login as Camp Logistics

1. Sign out from the current account using the profile menu.
2. Return to the login screen.
3. Enter the camp Logistics email, for example:

   ```text
   logistics.lead@camp-alpha.mil
   ```

4. Enter the generated password:

   ```text
   SACRMS_CAMP_ALPHA
   ```

5. Click **Authenticate**.
6. Confirm that the dashboard and resources belong only to the assigned camp.
7. Camp Logistics users can submit supply requests and confirm receipt of requests in transit, but cannot approve or dispatch requests.

### Switching between accounts

1. Open the profile menu in the top-right corner.
2. Click **Sign Out**.
3. Enter the next user's email and password.
4. Click **Authenticate**.

The application stores the JWT in `sessionStorage`. Signing out removes the current token and user profile from the browser session. If an old session prevents testing, clear the site's session/local storage in browser developer tools and reload.

## Using the application

### Create a camp

1. Sign in as the HQ Admin.
2. Open the Camps/Camp Access view.
3. Provide name, code, type, personnel, location, commander and optional weather/settings data.
4. Optionally upload a camp profile image.
5. Save the camp.
6. The backend creates the camp leader and returns temporary credentials.
7. Select the new camp from the header or camp list.

Camp creation is server-backed and requires an Admin JWT.

### Manage resources

Resources belong to a camp and include:

```text
name, SKU, category, current stock, unit, minimum level,
maximum capacity, burn rate, location and camp ID
```

The frontend calculates resource health:

| State | Meaning |
|---|---|
| Healthy | Stock is above warning threshold |
| Warning | Stock is at or below the warning threshold |
| Critical | Stock is at/below minimum or critical threshold |

Estimated runway is approximately:

```text
current stock / (burn rate per person per day × camp personnel)
```

When stock changes, update stock, status, and estimated runway together.

### Record consumption

Consumption records include camp, resource, category, date, quantity, headcount, purpose, unit, and recording user. The API validates non-negative quantity and headcount.

### Equipment and maintenance

Equipment tracks camp, name, serial number, category, model, status, health, operating hours, location, and service dates. Maintenance tasks reference equipment and contain title, priority, status, assignee, due date, description, and camp.

### Alerts and reports

Alerts can be acknowledged when the current role permits it. Resource alerts represent unresolved stock conditions and should be resolved through inventory or resupply actions rather than simply dismissed. Reports summarize operational data loaded for the permitted camp scope.

## Roles and permissions

### Frontend view access

| Role | Views |
|---|---|
| `Admin` | All views |
| `Logistics` | Dashboard, resources, consumption, equipment, maintenance, alerts, reports, settings, requests |
| `Maintenance` | Dashboard, camps, equipment, maintenance, alerts, reports |
| `Maintenance Supervisor` | Dashboard, camps, equipment, maintenance, alerts, reports |
| `Commander` | Dashboard, camps, alerts, reports |

The backend schema currently accepts `Admin`, `Logistics`, `Maintenance`, and `Maintenance Supervisor`. `Commander` exists in the frontend type/permission model but is not currently accepted by the Mongoose user schema.

### Server-side authorization

Frontend navigation hiding is not security. The backend repeats:

- JWT authentication;
- role authorization through `requireRole`;
- camp-scope checks for non-Admin users;
- resource/request/equipment/maintenance ownership checks.

## Supply-request workflow

### Status transitions

| Current | Next | Allowed actor |
|---|---|---|
| `Submitted` | `Approved` | Admin |
| `Submitted` | `Rejected` | Admin |
| `Approved` | `Rejected` | Admin |
| `Approved` | `In Transit` | Admin |
| `In Transit` | `Received` | Logistics user assigned to the request camp |

The frontend displays the HQ pending-request overlay for unresolved requests. The overlay is a review shortcut; opening it does not resolve the request.

### Important dispatch behavior

The current backend has no separate HQ warehouse/depot model. Therefore:

- dispatch stores carrier and ETA and changes the request to `In Transit`;
- dispatch does **not** deduct stock from a separate HQ source;
- receipt finds the destination resource and adds the requested quantity, capped at `maxCapacity`;
- receipt stores `receivedAt` and audit records.

Some frontend code models richer source-resource dispatch behavior. Treat frontend and backend behavior as an integration area requiring synchronization before claiming that central stock is deducted. See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for details.

## API overview

All routes are prefixed with `/api`.

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Health check |
| POST | `/auth/login` | Public | Authenticate and receive JWT |
| POST | `/camps` | Admin | Create camp, upload image and create leader |
| GET | `/camps` | Authenticated | List permitted camps |
| PATCH | `/camps/:id/settings` | Authenticated | Update allowed camp settings |
| DELETE | `/camps/:id` | Admin | Delete camp and related records |
| GET | `/resources?campId=...` | Authenticated | Read resources |
| POST | `/resources` | Admin/Logistics | Create resource |
| PATCH | `/resources/:id` | Admin/Logistics | Update resource |
| DELETE | `/resources/:id` | Admin/Logistics | Delete resource |
| GET | `/consumption?campId=...` | Authenticated | Read consumption |
| POST | `/consumption` | Admin/Logistics | Record consumption |
| POST | `/requests` | Logistics | Submit supply request |
| GET | `/requests` | Authenticated | List permitted requests |
| PATCH | `/requests/:id/status` | Authenticated | Approve, reject, dispatch or receive |
| GET | `/equipment?campId=...` | Authenticated | Read equipment |
| POST | `/equipment` | Admin/Logistics/Maintenance roles | Create equipment |
| PATCH | `/equipment/:id` | Admin/Maintenance roles | Update equipment |
| GET | `/maintenance?campId=...` | Authenticated | Read maintenance tasks |
| POST | `/maintenance` | Admin/Logistics/Maintenance roles | Create task |
| PATCH | `/maintenance/:id` | Admin/Logistics/Maintenance roles | Update task |

## Database models

The schemas are defined in `server/models/models.ts`.

| Model | Main data |
|---|---|
| `User` | Identity, email, bcrypt hash, role, camp, rank, service ID |
| `Camp` | Name, type, code, personnel, location, commander, status, thresholds and alert settings |
| `Resource` | Camp, name, SKU, category, stock, levels, burn rate and location |
| `Consumption` | Camp, resource, date, quantity, headcount, purpose and recording user |
| `SupplyRequest` | Requester, camp, resource, quantity, urgency, reason, status, delivery and rejection data |
| `Equipment` | Camp, asset identity, category, status, health and service data |
| `MaintenanceTask` | Camp, equipment, title, priority, status, assignee, due date and description |
| `AuditLog` | Actor, action, entity type/id, details and timestamps |

Mongoose timestamps are enabled for these schemas. The current models are not exported with explicit TypeScript document interfaces, so model typing should be improved carefully rather than through unsafe casts.

## Browser persistence

MongoDB is the operational data store when the API is available. Browser storage is used for session and interface convenience:

| Storage | Key | Purpose |
|---|---|---|
| `sessionStorage` | `sacrms_token` | JWT for the current browser session |
| `sessionStorage` | `sacrms_user` | Authenticated profile cache |
| `localStorage` | `sacrms_theme` | Plain/Army theme selection |
| `localStorage` | `sacrms_selected_camp` | Selected camp for Admin navigation |
| `localStorage` | `sacrms-active-view` | Last active screen |
| `localStorage` | `sacrms_pending_requests` | Frontend pending-request overlay queue |
| `localStorage` | `sacrms_acknowledged_alerts_<userId>` | Per-user alert acknowledgements |

Clearing browser storage removes the local session and UI preferences. It does not delete MongoDB data.

## Database seeding and reset

> `npm run server:seed` is destructive for the collections it clears. Run it only against a disposable development database.

The seed script:

1. connects to MongoDB;
2. deletes `User`, `Resource`, `Consumption`, and `Camp` records;
3. inserts the HQ Admin;
4. exits.

It does not currently clear or populate every model. It does not create camp logins or demo inventory. To create realistic demo data, use the application or extend the seed script deliberately.

## Validation commands

Run the smallest relevant checks after changes:

```bash
npm run lint
npm run build
```

`npm run lint` runs `tsc --noEmit` over the repository. `npm run build` builds the Vite frontend. There is currently no automated unit, integration, or end-to-end test suite.

## Known limitations

- No separate HQ warehouse/depot model exists.
- Frontend and backend source-inventory dispatch behavior is not fully unified.
- Multi-document stock/request updates are not protected by MongoDB transactions.
- Several API fields are free-form and need stronger schema validation.
- Browser prompts remain for some carrier, ETA, and rejection inputs.
- JWT revocation and refresh-token handling are not implemented.
- The development JWT fallback must not be used in production.
- Local disk uploads are not durable deployment storage.
- API rate limiting, security headers, structured logging, and production monitoring are not configured.
- The seed data is intentionally minimal.
- Camp-created credentials are temporary output from the create response; they are not fixed credentials in source.
- Frontend view restrictions do not replace server authorization.

## Recommended next steps

1. Add a distinct HQ warehouse and inventory model.
2. Use one transactional stock/request workflow in both frontend and backend.
3. Add explicit TypeScript API DTOs and Mongoose document interfaces.
4. Add request-body validation for every endpoint.
5. Replace browser prompts with accessible React modals.
6. Add tests for authentication, role permissions, camp isolation, stock boundaries and request transitions.
7. Add complete safe demo seed data for camps, users, inventory, equipment and requests.
8. Add pagination, database indexes, rate limiting, secure headers and structured logging.
9. Move uploaded images to durable object storage for deployment.
10. Add an audit-history screen and request timeline.

## Demonstration/video flow

For a project presentation, use fake data and demonstrate:

```text
Admin login
  -> Camp overview and readiness dashboard
  -> Resource inventory and low-stock alert
  -> Camp Logistics login and camp-scoped data
  -> Consumption entry
  -> Supply request submission
  -> Admin approval and dispatch
  -> Camp receipt confirmation
  -> Equipment and maintenance status
  -> Alerts, reports and settings
```

Explain the architecture accurately. Do not claim live GPS, real carrier integration, a separate HQ warehouse, or production-grade military security unless those capabilities are implemented and tested.

## License

The application source includes Apache-2.0 license metadata. Confirm the intended repository license before distributing the project.
