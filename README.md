# SACRMS

**Smart Army Camp Resource Management System** is a React and Vite operations dashboard for managing camp logistics, resources, equipment, maintenance, alerts, and operational readiness.

## Features

- HQ admin workflow to create new camps and generate camp login credentials
- Selected-camp dashboard that automatically loads the active camp after creation or login
- Camp-specific branch access for HQ Admin and created camp logistics identities
- Camp-level resource tracking, restocking, and transfer workflows
- Resource consumption monitoring
- Equipment and maintenance tracking
- Alert acknowledgement and resupply dispatch workflows
- Reports, personnel views, and system configuration screens
- Demo login profiles for the default command identities
- Plain black-and-white default theme
- Optional Army Mode with woodland camouflage styling across the workspace and navigation
- Camp-to-centre supply requirement workflow with approval and dispatch status tracking
- MongoDB-backed authentication, camps, resources, consumption records, requests, equipment, maintenance tasks, and audit logs
- Browser `localStorage` used only for session token, selected camp convenience, theme, and generated credential display
- Toast notifications and modal workflows
- HQ dashboard showing all existing camps created in the app

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Material Symbols (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Run both services

Open two terminals in the project root and run these separately:

#### Frontend

```bash
npm run dev
```

The frontend is served at [http://localhost:3000](http://localhost:3000).

#### Backend

```bash
npm run server
```

The backend API starts on [http://localhost:4000](http://localhost:4000).

> The project needs both the frontend and backend running at the same time. The frontend alone will not provide the app data flow; the backend must be running to handle authentication and API calls.

### Environment setup

The backend depends on a MongoDB connection string in the project `.env` file. The project already includes a local `.env` with:

```env
PORT=4000
MONGODB_URI=mongodb+srv://Abhishek2006:Abhishek2006@cluster0.bjnrj1z.mongodb.net/?appName=Cluster0
JWT_SECRET=sacrms-local-development-jwt-secret-change-before-production
CLIENT_ORIGIN=http://localhost:3000
```

If you are running it on another machine, update `MONGODB_URI` and `CLIENT_ORIGIN` as needed before starting the backend.

## Using the Application

The application is designed around an HQ admin workflow and camp-specific access.

### Default Login Credentials

- **HQ Admin**
  - Email: `commander@logistics.node`
  - Password: `SACRMS-ADMIN`

  - **CAMP_1**
  - Email: `logistics.lead@camp-alpha.mil`
  - Password: `SACRMS_CAMP_ALPHA`

   - **CAMP_1**
  - Email: `logistics.lead@camp-bravo.mil`
  - Password: `SACRMS_CAMP_BRAVO`

This is the only default login. Camp credentials are generated only after the HQ Admin creates a camp through the Camp Access form.

### Creating a New Camp

1. Log in as the HQ Admin.
2. Open the **Camp Access** page.
3. Fill in the camp form with the camp name, code, type, personnel, location, commander, readiness score, weather, and temperature.
4. Click **Save & Create Credentials**.
5. The app generates a camp login profile automatically.
6. The new camp is added to the saved camp list and selected as the active camp.
7. The new credentials are also shown in the Users screen and remain saved in the browser state.

Example generated credentials:

- Username: `logistics.lead@camp-delta.mil`
- Password: `SACRMS_CAMP_DELTA`

The generated username is based on the camp name. The password is always `SACRMS_<CAMP_NAME>`: non-alphanumeric characters in the camp name become underscores and the result is converted to uppercase. For example, `Camp Alpha` generates `SACRMS_CAMP_ALPHA`.

### Dashboard Behavior

After a camp is created or a camp user logs in:

- the selected camp is automatically activated
- the dashboard shows that camp's details
- the HQ dashboard also lists all previously created camps
- the app remembers the selected camp after reload

Use the left navigation to switch between the dashboard, camps, resources, consumption, equipment, maintenance, alerts, reports, users, and settings. Select a camp from the header or the HQ camp list to view camp-specific data.

To switch visual themes, open the profile menu in the top-right corner and select **Army Mode**. Plain mode uses black text on a white background. Army Mode adds a woodland camouflage background and field-command navigation styling. The selected theme is remembered after reload.

### Role Permissions

The demo applies a branch-based access model:

- **HQ Admin**: full access to headquarters command, camp creation, and all camp logistics operations
- **Camp Logistics Lead**: a generated camp identity created by the HQ Admin for a specific camp

Restricted modules are hidden from the navigation, and restricted data changes are rejected with an access notification.

Created camp identities follow this pattern:
- Email: `logistics.lead@camp-name.mil`
- Password: `SACRMS_<CAMP_NAME>`

### Supply Requirement Workflow

Camp-side leaders open **Supply Requests** to submit a requirement for their selected camp. The request records the supply, quantity, urgency, reason, requesting camp, and requester. The HQ Admin queue shows submitted requirements across all camp branches. Only HQ Admin accepts valid requirements and marks them as dispatched; the requesting camp then confirms delivery with **Confirm Received**. HQ Admin does not create camp requirements.

### Other commands

```bash
# Type-check the project
npm run lint

# Create a production build
npm run build

# Preview the production build locally
npm run preview

# Seed backend demo data if needed
npm run server:seed
```

## Project Structure

```text
frontend/src/
├── components/
│   ├── alerts/          Alert management
│   ├── auth/            Login and demo profiles
│   ├── camps/            Camp management
│   ├── consumption/      Consumption analysis
│   ├── dashboard/        Main readiness dashboard
│   ├── equipment/        Equipment tracking
│   ├── layout/           Sidebar and header
│   ├── maintenance/      Maintenance workflows
│   ├── modals/           Modal and toast components
│   ├── reports/          Reporting views
│   ├── resources/        Resource inventory
│   ├── settings/         Application settings
│   └── users/             User management
│   └── users/             User management
├── context/              Shared application state
├── data/                 Mock/demo data
├── types/                Shared TypeScript types
├── App.tsx               Application shell and view routing
├── index.css             Global styles
└── main.tsx              React entry point

server/
├── config/               MongoDB connection
├── middleware/           Authentication and authorization
├── models/               MongoDB models
├── index.ts              Express API
└── seed.ts               Demo database seed
```

## Data Storage and Resetting State

The backend stores operational records in MongoDB. This includes users, camps, resources, consumption records, supply requests, equipment, maintenance tasks, and audit logs. Camp creation and deletion are performed through the authenticated API. Consumption entries recorded from the Consumption Telemetry page are also saved and restored from MongoDB.

The browser stores only session and interface state under keys prefixed with `sacrms_`. Generated plaintext camp passwords are kept locally so HQ can view them immediately after creation; MongoDB stores the corresponding bcrypt password hash.

To reset browser session state, clear the site's local storage in the browser's developer tools and reload the page. To reset the MongoDB demo database, run `npm run server:seed`.

Supply requests follow `Submitted → Approved → In Transit → Received`, or `Submitted/Approved → Rejected`. Dispatch deducts cargo from the selected central stock, receipt adds it to the requesting camp, and each transition records the actor and timestamp in the request history.

The Express API provides server-side authentication, authorization, and persistence. The frontend requires the backend health endpoint before showing application data.

## Production Build

Build the application with:

```bash
npm run build
```

The generated files are written to `dist/`. Serve that directory with a static web server or inspect it locally with:

```bash
npm run preview
```

## License

This project includes Apache-2.0 license metadata in the application source.
