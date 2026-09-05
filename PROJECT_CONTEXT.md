# SACRMS Project Context for AI Assistants

## 1. Project Identity

SACRMS means **Smart Army Camp Resource Management System**.

It is a frontend prototype for centralized military camp logistics. The system represents one headquarters admin managing several camps. Camp logistics users submit supply requirements to headquarters. Headquarters reviews, approves, dispatches, and tracks those requirements until the requesting camp confirms receipt.

The React screens are organized under `frontend/`, and the repository also contains a Node.js/Express/MongoDB API under `server/`. The API provides server-side authentication, role checks, camp scoping, supply-request transitions, stock movement, and audit records. The existing screens still use their original local demo state until the frontend data layer is migrated to the API and a MongoDB Atlas URI is configured.

## 2. Main Business Goal

The application should help command personnel answer these questions:

- What resources are available at each camp?
- Which resources are near or below minimum levels?
- Which camps need supplies?
- Has headquarters approved and dispatched a request?
- Has the requesting camp received the shipment?
- What equipment and maintenance work affect readiness?
- What alerts require attention?

The most important operational workflow is:

```text
Camp submits requirement
        -> HQ Admin reviews
        -> HQ approves or rejects
        -> HQ dispatches with carrier and ETA
        -> Requesting camp confirms receipt
```

Supply request statuses are:

```text
Submitted -> Approved -> In Transit -> Received
Submitted/Approved -> Rejected
```

## 3. Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Material Symbols icons loaded by the HTML/CSS setup
- Browser `localStorage` for demo persistence
- Node.js + Express API in `server/`
- MongoDB + Mongoose
- JWT authentication and bcrypt password hashing

Important commands:

```bash
npm install
npm run dev       # Vite development server on port 3000
npm run lint      # TypeScript check: tsc --noEmit
npm run build     # Production build
npm run preview   # Preview production build
npm run clean     # Windows-safe removal of dist/
```

## 4. Login Identities

The intended active demo identities are exactly four:

| Identity | Email | Password | Camp scope |
|---|---|---|---|
| HQ Admin | `commander@logistics.node` | `SACRMS-ADMIN` | Headquarters; currently assigned to `camp-alpha` as the central stock source |
| Camp Alpha Leader | `logistics.lead@camp-alpha.mil` | `SACRMS-CAMP-ALPHA` | Camp Alpha |
| Camp Bravo Leader | `logistics.lead@camp-bravo.mil` | `SACRMS-CAMP-BRAVO` | Camp Bravo |
| Camp Charlie Leader | `logistics.lead@camp-charlie.mil` | `SACRMS-CAMP-CHARLIE` | Camp Charlie |

The login screen also provides four instant demo profile buttons. Users must sign out before using another identity. The header and Users screen do not impersonate other accounts.

Maintenance credential entries and extra role shortcut paths were removed from the active demo login flow. The shared type model still contains maintenance-related role types because maintenance screens and permissions remain part of the prototype.

## 5. Roles and Permissions

### HQ Admin

- Full access to all navigation views.
- Sees all camp supply requests.
- Approves or rejects submitted requests.
- Dispatches approved requests.
- Can select camps in the header for viewing camp data.
- Receives the global pending camp request popup.
- Acts as the central stock dispatcher. In the current demo, the admin profile's `campId` identifies the source stock camp.

### Camp Logistics

- Sees only the camp assigned to the logged-in profile.
- Can view and modify camp resources allowed by the prototype.
- Can submit supply requirements.
- Sees only supply requests belonging to the assigned camp.
- Can confirm receipt only for its own request while the request is `In Transit`.
- Cannot approve, reject, or dispatch requests.

### Maintenance roles

Maintenance and Maintenance Supervisor permissions remain represented in `roleViews` and shared types for equipment and work-order screens, but they are not among the four active login identities listed above.

### Access enforcement

Navigation visibility is controlled by `canAccessView` and the `roleViews` map in `frontend/src/context/AppContext.tsx`. Business actions also check the current role before changing state. A future backend must repeat these checks server-side; frontend checks are not security.

## 6. Supply Request Behavior

### Camp submission

`submitSupplyRequest` in `frontend/src/context/AppContext.tsx`:

1. Allows only a Logistics user to submit.
2. Creates a request with a unique ID and `Submitted` status.
3. Adds requester, camp, quantity, unit, urgency, reason, timestamp, and audit log entry.
4. Adds an operational alert for HQ.
5. Adds the request to `pendingCampRequests`.
6. Persists the request, alert, and pending queue to `localStorage`.

The form is in `frontend/src/components/requests/SupplyRequestsView.tsx`.

### HQ approval

The HQ Admin sees all requests in the Central Queue. For a `Submitted` request, Admin can select **Approve**, which changes the status to `Approved` and records the actor and timestamp in the audit log.

Approval does not change inventory.

### HQ rejection

Admin can reject a `Submitted` or `Approved` request. A rejection reason is required by the current browser prompt. The request becomes `Rejected`, stores the reason, records the actor and timestamp, and is removed from the pending queue.

### HQ dispatch

Admin can dispatch only an `Approved` request. The current UI asks for carrier/transport method and ETA using browser prompts.

Dispatch:

1. Searches the admin's source camp inventory.
2. Matches the requested category and normalized exact resource name.
3. Requires enough stock for the requested quantity.
4. Deducts the quantity from the source resource.
5. Recalculates resource status and estimated runway days.
6. Stores `sourceCampId` and `sourceResourceId` on the request.
7. Changes status to `In Transit`.
8. Records carrier, ETA, actor, timestamp, and audit history.

If there is no exact matching resource or insufficient stock, dispatch is blocked and inventory is unchanged.

### Camp receipt

The requesting Camp Logistics user sees **Confirm Received** only when:

- the request status is `In Transit`, and
- the request belongs to the logged-in user's current camp.

Receipt:

1. Finds the destination resource using destination camp, category, and exact normalized resource name.
2. Adds the requested quantity up to the destination max capacity.
3. Recalculates status and estimated runway days.
4. Creates a destination resource if no matching destination resource exists and a recorded source resource is available.
5. Changes status to `Received`.
6. Records received timestamp, actor, and audit history.
7. Removes the request from the pending HQ queue.

Therefore, in the diesel example, HQ dispatch deducts diesel from the configured HQ source stock, and the requesting camp's diesel inventory increases when that camp confirms receipt.

## 7. Important Inventory Rules

`ResourceItem` contains:

- `id`
- `name`
- `category`
- `currentStock`
- `unit`
- `minLevel`
- `maxCapacity`
- `burnRatePerPersonPerDay`
- `estDays`
- `status`
- `campId`
- icon, location, SKU, and last restocked date

Status calculation:

- `Critical` when stock is at/below minimum or at 20% capacity or less.
- `Warning` when stock is at 45% capacity or less.
- `Healthy` otherwise.

Runway calculation is approximately:

```text
current stock / (burn rate per person per day * camp personnel)
```

Resource mutations include adding, updating, deleting, restocking, transferring, dispatching, and receiving. Whenever changing stock, preserve status and `estDays` consistency.

## 8. Pending HQ Request Alert

The request queue is stored under `sacrms_pending_requests`.

The global modal in `frontend/src/App.tsx` is shown only when:

- the user is authenticated,
- the current user role is `Admin`, and
- at least one pending request is available and not dismissed in the current session.

Closing the modal or choosing **Review Later** hides that item for the current session only. The item remains in `localStorage` and appears again after the admin logs in later.

The request is removed from the persistent queue only after a status action such as approval, rejection, or receipt. Review Request navigates to the Supply Requests screen but does not resolve the request.

## 9. Application State and Persistence

`frontend/src/context/AppContext.tsx` is the main source of truth for the current React demo. It provides:

- authentication and current user
- theme
- current view
- selected camp
- camps
- resources
- alerts
- equipment
- maintenance tasks
- supply requests
- pending camp request queue
- modal state
- toast notifications
- action functions and authorization checks

The API endpoints currently include:

```text
POST  /api/auth/login
GET   /api/health
GET   /api/camps
POST  /api/camps                 # HQ Admin creates camp + leader credentials
GET   /api/resources
POST  /api/requests
GET   /api/requests
PATCH /api/requests/:id/status
GET   /api/equipment
GET   /api/maintenance
```

Current `localStorage` keys include:

```text
sacrms_user
sacrms_theme
sacrms_camps
sacrms_resources
sacrms_alerts
sacrms_equipment
sacrms_tasks
sacrms_supply_requests
sacrms_pending_requests
```

Data is local to one browser profile. Clearing site storage resets the demo to seed data.

## 10. Important Files

```text
frontend/src/App.tsx
  Root shell, view routing, global modal rendering, HQ pending request popup.

frontend/src/context/AppContext.tsx
  Main state store, permissions, login, request lifecycle, inventory mutations, persistence.

frontend/src/types/index.ts
  Shared TypeScript models and status unions.

frontend/src/data/mockData.ts
  Seed camps, resources, alerts, users, equipment, maintenance tasks, and demo data.

frontend/src/components/auth/LoginView.tsx
  Login form and four demo identity buttons.

frontend/src/components/requests/SupplyRequestsView.tsx
  Camp submission form, HQ queue, approval/rejection/dispatch controls, receipt confirmation.

frontend/src/components/resources/ResourceInventoryView.tsx
  Searchable and filterable inventory table, restocking, resource actions, CSV export.

frontend/src/components/layout/TopHeader.tsx
  Navigation, alerts, camp selector, dispatch shortcut, theme, profile menu.

frontend/src/components/layout/Sidebar.tsx
  Role-filtered navigation and alert badge.

frontend/src/components/dashboard/DashboardView.tsx
  Main operational readiness dashboard.

frontend/src/components/camps/CampsView.tsx
  Camp overview and camp details.

frontend/src/components/alerts/AlertsView.tsx
  Alert list, acknowledgement, and resupply actions.

frontend/src/components/equipment/EquipmentView.tsx
  Equipment status and asset operations.

frontend/src/components/maintenance/MaintenanceView.tsx
  Maintenance task and work-order operations.

frontend/src/components/consumption/ConsumptionView.tsx
  Consumption history and analytics.

frontend/src/components/consumption/ConsumptionView.tsx
  Consumption history and analytics.

frontend/src/components/reports/ReportsView.tsx
  Reports and operational summaries.

frontend/src/components/users/UsersView.tsx
  Displays the four active demo identities; it does not switch accounts.

frontend/src/components/settings/SettingsView.tsx
  Application settings.

frontend/src/components/modals/
  Add resource, quick restock, dispatch, help, apps drawer, and toast components.
```

## 11. Current Demo Data Caveats

- Camp Alpha is labeled `Live`, Camp Bravo is `Live`, Camp Charlie is `Reserve`, and Camp Delta exists in seed data but has no active login identity.
- The HQ Admin currently has `campId: camp-alpha`, so the current prototype treats Camp Alpha inventory as central source stock. A production design should introduce a distinct HQ warehouse/depot instead of using a camp as the source.
- The seed request is a Camp Bravo Diesel Fuel request for 8,000 L. Camp Bravo starts with 6,500 L of diesel, while Camp Alpha has 12,000 L of Diesel Fuel. The HQ source therefore needs the matching Camp Alpha diesel resource for dispatch.
- Dispatch is currently represented as immediate stock deduction at HQ and `In Transit` status. There is no real carrier integration or live GPS tracking.
- Browser prompts are used for carrier, ETA, and rejection reason. These should become application modals for production-quality validation and accessibility.
- The API uses bcrypt password hashes and JWTs. The old React demo authentication remains client-side until the frontend migration is completed. Never use the demo passwords or development JWT fallback in production.
- Multiple browser tabs do not have robust cross-tab conflict handling.
- There are no automated unit or end-to-end tests yet.

## 12. Recommended Future Improvements

Prioritize these changes before treating the application as production-ready:

1. Add a real backend, database, server-side authentication, and authorization.
2. Add a distinct HQ warehouse/depot entity and source inventory model.
3. Add exact resource identity by SKU or resource ID to every request instead of relying mainly on typed resource name.
4. Replace browser prompts with accessible React modals and form validation.
5. Add request delivery timeline, notification center, and audit history view.
6. Add optimistic update protection and transaction handling for dispatch/receipt.
7. Add tests for permissions and the full request lifecycle.
8. Add validation for units, negative values, zero quantities, max capacity, and duplicate submissions.
9. Add cross-tab synchronization or server events for new HQ requests.
10. Improve reset/demo data controls and migration handling for old `localStorage` data.

## 13. Backend Setup

Copy `server/.env.example` to `.env` and add a MongoDB Atlas connection string plus a long random JWT secret:

```text
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
CLIENT_ORIGIN=http://localhost:3000
```

Then run:

```bash
npm run server:seed
npm run server
```

The API listens on `http://localhost:4000`. Vite proxies `/api` requests to that server during development.

The remaining integration task is to replace local `AppContext` reads and mutations with an authenticated API client, while retaining the existing UI and role-scoped behavior.

## 14. Instructions for Any AI Modifying This Project

Before editing:

- Read this file, `README.md`, `frontend/src/types/index.ts`, and the relevant component/context file.
- Preserve the HQ-to-camp workflow and the four active login identities unless the user explicitly changes the business rules.
- Check role authorization before adding or changing an action.
- Keep camp data scoped for camp users.
- Do not make dispatch deduct from the requesting camp; dispatch deducts from the configured source stock, and receipt adds to the destination camp.
- When changing inventory, update stock, status, and `estDays` together.
- Keep pending HQ requests persistent until an actual request status action resolves them.
- Preserve `localStorage` compatibility unless a migration is intentionally added.
- Do not add production claims to documentation while authentication and persistence remain client-side.
- After edits, run `npm run lint` and `npm run build`.

## 15. Definition of Correct Diesel Request Behavior

A correct diesel test should work like this:

1. Log in as Camp Bravo.
2. Open Supply Requests.
3. Submit a Diesel Fuel request with a valid quantity.
4. Sign out.
5. Log in as HQ Admin.
6. Confirm the HQ requirement popup appears.
7. Open the request queue and approve the request.
8. Dispatch it with carrier and ETA.
9. Confirm HQ source Diesel Fuel stock decreases by the request quantity.
10. Confirm the request becomes `In Transit` and records source resource, carrier, ETA, actor, and audit history.
11. Sign out.
12. Log in as Camp Bravo.
13. Confirm only Camp Bravo sees the request and the Confirm Received action.
14. Confirm receipt.
15. Confirm Camp Bravo Diesel Fuel stock increases by the request quantity, capped at max capacity.
16. Confirm the request becomes `Received`, records the receipt timestamp, and disappears from the persistent HQ pending queue.

If any step fails, inspect `frontend/src/context/AppContext.tsx` first, then `frontend/src/components/requests/SupplyRequestsView.tsx` and `frontend/src/App.tsx`.
