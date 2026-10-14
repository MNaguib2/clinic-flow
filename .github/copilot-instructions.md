# Clinic Management App — Copilot Context

Use this file as a map of the repository, not as a substitute for inspecting the current implementation. Before changing code, read the relevant source files, tests, and any more specific instructions. This project evolves; update this context when its architecture or workflows change.

## Project overview

This repository contains a clinic-management application in two independently managed projects:

- `back-end/`: NestJS API, using Fastify, Prisma, and MySQL/MariaDB.
- `clinic-front/`: Angular application with server-side rendering (SSR), standalone components, and NgRx Signals.

The domain is organization-centric: organizations have clinics, staff, roles, and clinical/administrative records. The Prisma schema describes a much broader product than the currently implemented HTTP modules. Do not assume a schema model already has an API or UI.

## Repository map

### Backend (`back-end/`)

- `src/main.ts`, `src/setup.ts`: load environment configuration, create the HTTPS Fastify-backed Nest app, and configure middleware, sessions, validation, CORS, rate limiting, and the `/api` prefix.
- `src/app.module.ts`: root module; currently imports database, organization, user, clinic, and specialty modules.
- `src/core/`:
  - `config/`: environment and session configuration.
  - `database/`, `service/`: database module and Prisma service.
  - `decorators/`, `guards/`, `interfaces/`: current-user and request/auth infrastructure.
  - `middleware/`, `session/`: session user attachment and Prisma-backed session store.
- `src/user/`: user endpoints, login/refresh, DTOs, and user service.
- `src/organization/`: organization registration endpoint, DTO, and service.
- `src/clinic/`: clinic CRUD endpoint, DTO, and service.
- `src/specialty/`: specialty CRUD endpoint, DTO, service, and public serialization interceptor.
- `prisma/schema.prisma`: database model source of truth.
- `prisma/migrations/`: committed SQL migration history.
- `generated/prisma/`: generated Prisma client; do not hand-edit generated files.
- `test/`: backend end-to-end tests; unit tests live alongside source as `*.spec.ts`.
- `certs/`: local HTTPS certificates. Do not expose or replace certificate/key material without a specific need.

Current API surface (all routes are under `/api`):

- `POST /organizations/register`
- `POST /users/login`, `POST /users/refresh`
- Authenticated user CRUD under `/users`
- Authenticated clinic CRUD under `/clinics`
- Authenticated specialty CRUD under `/specialties`

Check the controller and DTO before relying on a route, HTTP verb, or payload shape. Authenticated routes derive organization context from the session's current user; preserve tenant scoping in services and queries.

The Prisma schema includes organization, user/role/permission, clinic/specialty, patient/account/record/sharing, schedules, cases/appointments/visits/diagnoses/prescriptions/requests/attachments, products/units/services, invoices/payments, inventory/transactions, expenses/recurring expenses, refresh/login/password-reset sessions, and audit logs. Consult `schema.prisma` for exact fields, relations, and constraints before database changes.

### Frontend (`clinic-front/`)

- `src/main.ts`, `src/main.server.ts`, `src/server.ts`: browser and SSR entry points.
- `src/app/app.ts`, `app.config.ts`, `app.config.server.ts`: root component and application providers.
- `src/app/app.routes.ts`: `/` home, lazy-loaded `/login` and `/register`, wildcard redirects to home.
- `src/app/core/`:
  - `auth/`: NgRx SignalStore for login and registration request state.
  - `config/`: API URL injection token and configuration.
  - `interceptors/`: HTTP interceptor(s).
  - `services/language/`, `services/theme/`: English/Arabic language and light/dark theme services.
- `src/app/features/`: `home/`, `login/`, and `register/` pages.
- `src/app/share/`: shared phone input, theme toggle, button, and shared module.
- `src/public/locale/`: English and Arabic translations.
- `src/public/css/`, `fonts/`: global direction styles and font assets.
- `src/styles.scss`, component `.scss` files: global and feature styling.
- `src/**/*.spec.ts`: Vitest/Angular tests.

The UI currently uses reactive forms, lazy-loaded login/registration pages, shared UI components, translation via `@ngx-translate/core`, and signals for state. The language service sets the document language/direction and persists the choice; the theme service persists dark mode. These services guard browser-only APIs for SSR. Keep server rendering safe when adding browser-specific behavior.

`app.config.ts` configures the `API_URL`, HTTP client, translations, router, and hydration. Check it and the relevant store before wiring API calls; do not assume every feature uses the same URL construction or credentials behavior.

## Implementation conventions

- Keep backend concerns in the existing Nest module/controller/DTO/service structure. Validate input through DTOs and the global validation pipe; follow existing endpoint patterns.
- Preserve organization scoping and authorization in every tenant-owned read or write. Do not trust organization IDs supplied by a client when session identity provides the scope.
- Keep Prisma schema, migrations, and generated-client workflow consistent. Use existing Prisma scripts/tooling; never edit generated output directly.
- Use Angular standalone components and existing feature/core/share boundaries. Prefer existing services and shared components over duplicating them.
- Preserve SSR compatibility and the existing translation, directionality, theme, and design-token patterns.
- Use strong types and explicit error handling. Do not swallow API/database errors or return success-shaped fallbacks.
- Make focused changes, include/update relevant tests and directly related documentation, and do not modify unrelated user work.
- Never copy secrets, `.env` contents, session secrets, passwords, or private key contents into source, documentation, logs, or chat. Use `.env.example` only as a configuration-name reference.

## Common commands

Run each command from its project directory:

```bash
# Backend (`back-end/`)
npm run start:dev
npm run build
npm test
npm run test:e2e
npm run prisma:generate

# Frontend (`clinic-front/`)
npm start
npm run build
npm test
```

For database migrations, inspect the Prisma schema, migration history, and environment first. Use the repository's Prisma workflow and the configured development database; never reset or migrate a production database as an exploratory step.

## Source-of-truth reminders

- `back-end/README.md` and `clinic-front/README.md` are starter-level documentation and may not describe all current behavior.
- Package scripts and current source are authoritative for commands and behavior; verify them before giving instructions.
- `back-end/.env.*` files and certificate/key files are sensitive. Do not read or reproduce their values unless the task specifically requires safe configuration work.
