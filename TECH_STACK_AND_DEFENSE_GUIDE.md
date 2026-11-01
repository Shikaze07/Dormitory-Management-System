# Dormitory Management System — Tech Stack & Defense Guide

A reference for the capstone defense: what we used, why we used it, and how to answer the panel.

---

## 1. System Overview

The Dormitory Management System is a **web-based platform with a companion Android app** that manages:

- **Users** with three roles — **Admin**, **Guard**, and **Resident**
- **Rooms** and **room assignments** (capacity, status, move-in/vacate history)
- **Visitor requests** submitted by residents, each with a **24-hour QR pass**
- **Access logs** — every check-in/check-out recorded by a guard scanning a QR code
- An **admin dashboard** with live stats and activity charts

**Flow in one sentence:** Admin registers residents and assigns rooms → each resident gets a unique QR code → residents request visitors, who get a temporary QR pass → guards scan QR codes with the mobile app → every entry/exit is logged and shown on the admin dashboard.

---

## 2. Tech Stack at a Glance

| Layer | Technology | Purpose |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Full-stack framework: pages, server logic, and API routes in one project |
| UI library | **React 19** | Component-based user interface |
| Language | **TypeScript** (+ some JavaScript) | Type safety, fewer runtime bugs |
| Styling | **Tailwind CSS v4** | Utility-first CSS for fast, consistent styling |
| UI components | **shadcn/ui + Radix UI** | Accessible, customizable components (dialogs, dropdowns, tables) |
| Icons | **Lucide React, Tabler Icons** | Icon sets |
| Database | **PostgreSQL** | Relational database for users, rooms, visitors, logs |
| ORM | **Prisma 7** (with `pg` adapter) | Type-safe database queries, schema & migrations |
| Authentication | **JWT via `jose`** + **bcryptjs** | Signed session tokens; hashed passwords |
| Route protection | **Next.js Proxy (middleware)** | Role-based access control per route |
| Validation | **Zod** + **React Hook Form** | Form and input validation (client and server) |
| Image storage | **Cloudinary** | Cloud hosting for resident/user photos |
| QR codes | **qrcode** + `crypto.randomUUID()` | Generate unique, unguessable QR tokens |
| Tables | **TanStack Table** | Sorting, filtering, pagination of data tables |
| Charts | **Recharts** | Dashboard activity charts |
| Drag & drop | **dnd-kit** | Drag-and-drop interactions (e.g., room assignment) |
| Notifications | **Sonner** | Toast messages (success/error feedback) |
| Dates | **date-fns** | Date formatting and calculations |
| Animation | **AOS, tw-animate-css** | Landing-page and UI animations |
| Theming | **next-themes** | Light/dark mode |
| Mobile | **Android APK** (`public/dormitory.apk`) | Guard QR scanner app, talks to `/api/mobile/*` |
| Tooling | **ESLint, tsx, Prisma CLI** | Linting, running seed scripts, DB management |

---

## 3. Each Technology Explained

### Next.js 16 (App Router)
- **What:** A React framework that handles both the frontend and backend.
- **Why we used it:** One codebase for the web UI, **Server Actions** (`lib/actions/*`) for form operations, and **API Routes** (`app/api/*`) for the mobile app. Server-side rendering makes pages load fast and keeps database access on the server only.
- **Where:** `app/` — `admin/`, `resident/`, `login/`, `api/mobile/`, `api/upload/`.

### React 19
- **What:** JavaScript library for building UIs from reusable components.
- **Why:** Industry standard, large ecosystem, works natively with Next.js.

### TypeScript
- **What:** JavaScript with static types.
- **Why:** Catches errors during development (e.g., wrong field names), better autocomplete, and Prisma generates types directly from our schema.

### Tailwind CSS + shadcn/ui + Radix UI
- **What:** Tailwind is utility-first CSS; shadcn/ui gives pre-built components built on Radix UI primitives.
- **Why:** Fast development, consistent design, responsive by default, and Radix components are **accessible** (keyboard navigation, screen reader support).

### PostgreSQL
- **What:** An open-source relational database.
- **Why:** Our data is highly **relational** (users ↔ rooms ↔ assignments ↔ visitors ↔ logs). PostgreSQL enforces relationships with foreign keys, supports transactions, and is reliable and free.

### Prisma ORM
- **What:** Object-Relational Mapper — write database queries in TypeScript instead of raw SQL.
- **Why:**
  - **Type-safe** queries generated from `prisma/schema.prisma`
  - **Prevents SQL injection** by using parameterized queries
  - Schema-as-code makes the database structure easy to version and review
  - Seeding (`npm run db:seed`) for test data

### Authentication — JWT (`jose`) + bcryptjs
- **Web:** On login, the password is checked with **bcrypt**, then a **JWT signed with HS256** is stored in an **httpOnly cookie** (expires in 2 hours). httpOnly means JavaScript in the browser cannot read it, protecting against XSS token theft.
- **Mobile:** `/api/mobile/login` returns a JWT (valid 7 days) that the app sends as `Authorization: Bearer <token>`.
- **Passwords:** Hashed with **bcrypt (10 salt rounds)** — never stored in plain text.
- **Where:** `lib/session.ts`, `lib/mobile-auth.ts`, `lib/actions/auth-actions.js`.

### Role-Based Access Control (Proxy / Middleware)
- **What:** `proxy.ts` runs before every request.
- **How:** It reads and verifies the session cookie, then checks route rules:
  - `/admin`, `/dashboard` → **Admin only**
  - `/resident` → **Resident only**
  - Not logged in → redirected to `/login`; wrong role → redirected to their own home page.
- Mobile API routes check the role separately (e.g., only **Guard/Admin** can scan).

### Zod + React Hook Form
- **What:** Zod defines validation schemas; React Hook Form manages form state.
- **Why:** Same rules validate input on the client (instant feedback) and on the server (security). Schemas are in `lib/validations/`.

### Cloudinary
- **What:** Cloud image hosting and CDN.
- **Why:** Storing images in the database is inefficient. Cloudinary stores photos, optimizes them, and serves them fast. We save only the image URL in the database. Uploads go through our server (`app/api/upload/route.ts`) so the API secret is never exposed to the browser.

### QR Code System
- **Residents:** Get a permanent token `USER-<UUID>`.
- **Visitors:** Get a token `VISIT-<UUID>` that **expires after 24 hours**.
- **Why UUID:** Random and practically impossible to guess, so QR codes can't be forged by changing an ID number.
- **Scan rules** (`app/api/mobile/scan/route.ts`):
  - Deactivated users are rejected
  - Expired, rejected, or cancelled visitor passes are rejected
  - **Check-out is only allowed after a check-in** (prevents double/invalid logs)
  - A pending visitor request is automatically marked **Approved** on first scan
  - The scanning guard's ID is recorded for accountability

### TanStack Table, Recharts, dnd-kit, Sonner
- **TanStack Table:** Search, sort, filter, and paginate users, rooms, logs, and visitor requests.
- **Recharts:** Visualizes check-in/out activity on the admin dashboard.
- **dnd-kit:** Drag-and-drop interactions in the UI.
- **Sonner:** Toast notifications for success/error feedback.

### Mobile App (APK)
- Distributed as `public/dormitory.apk`, downloadable from the website.
- Used by **guards** to scan QR codes, and by users to view logs/profile.
- Communicates with the backend through REST endpoints: `/api/mobile/login`, `/me`, `/scan`, `/logs`, `/visitors`.

---

## 4. System Architecture

```
 ┌───────────────┐        ┌────────────────────┐
 │  Web Browser  │        │ Android App (APK)  │
 │ Admin/Resident│        │  Guard QR Scanner  │
 └──────┬────────┘        └─────────┬──────────┘
        │ cookie (JWT)              │ Bearer token (JWT)
        ▼                           ▼
 ┌───────────────────────────────────────────────┐
 │                 Next.js 16 Server             │
 │  proxy.ts (auth + role check)                 │
 │  Pages (app/admin, app/resident)              │
 │  Server Actions (lib/actions)                 │
 │  API Routes (app/api/mobile, app/api/upload)  │
 │  Zod validation · bcrypt · jose               │
 └──────────┬───────────────────────┬────────────┘
            │ Prisma ORM            │ upload
            ▼                       ▼
     ┌─────────────┐         ┌─────────────┐
     │ PostgreSQL  │         │ Cloudinary  │
     └─────────────┘         └─────────────┘
```

---

## 5. Database Design

| Table | Purpose | Key fields |
|---|---|---|
| **User** | Admins, guards, residents | `username` (unique), `password` (hashed), `role`, `qr_code` (unique), `photo`, `is_active` |
| **Room** | Dorm rooms | `room_number` (unique), `capacity`, `status` (Available / Occupied / Full / Unavailable / Maintenance) |
| **RoomAssignment** | Which resident is in which room | `user_id`, `room_id`, `assigned_at`, `vacated_at`, `is_active` |
| **Visitor** | Visitor info + temporary pass | `qr_code` (unique), `qr_expires_at` |
| **VisitorRequest** | Resident's request to bring a visitor | `resident_id`, `visitor_id`, `purpose`, `expected_at`, `status` |
| **AccessLog** | Every check-in/check-out | `user_id` or `visitor_id`, `access_type`, `timestamp`, `scanned_by_id` |

**Design points to mention:**
- **RoomAssignment is a separate table** (not a column on User) so we keep **history** — when a resident moves out, `vacated_at` is set and `is_active` becomes false instead of deleting the record.
- **Soft deactivation** (`is_active`) on users instead of deleting, so old logs stay valid.
- **Indexes** on `user_id`, `room_id`, `visitor_id`, and `timestamp` for fast lookups and log filtering.
- **Enums** (`Role`, `RoomStatus`, `VisitStatus`, `AccessType`) prevent invalid values.
- **Normalized** structure — no duplicated data.

---

## 6. Possible Panel Questions & Suggested Answers

### A. General / Why this stack

**Q: Why did you choose Next.js instead of plain React or PHP/Laravel?**
A: Next.js lets us build the frontend and backend in one project using one language (TypeScript). It has built-in routing, server-side rendering, API routes for our mobile app, and middleware for route protection. This reduced complexity compared to maintaining a separate frontend and backend.

**Q: Why PostgreSQL instead of MySQL or MongoDB?**
A: Our data is relational — users, rooms, assignments, visitors, and logs all link to each other. A relational database enforces those links with foreign keys. PostgreSQL is open-source, reliable, and well-supported by Prisma and cloud hosts. MongoDB is better for unstructured data, which we don't have.

**Q: What is an ORM and why use Prisma?**
A: An ORM lets us interact with the database using code objects instead of raw SQL. Prisma gives us type safety, auto-completion, protection against SQL injection, and a readable schema file that documents the entire database.

**Q: Why TypeScript?**
A: It catches errors at development time instead of at runtime, makes the code easier to maintain, and works with Prisma's generated types.

**Q: Why Tailwind and shadcn/ui?**
A: They speed up development with consistent, responsive, and accessible components, so we could focus on functionality instead of writing CSS from scratch.

### B. Security

**Q: How do you store passwords?**
A: Passwords are hashed with **bcrypt** using 10 salt rounds. We never store or display plain-text passwords. On login we compare the input with the hash using `bcrypt.compare`.

**Q: How does login and session work?**
A: After verifying credentials, the server creates a **JWT signed with a secret key (HS256)** containing the user ID and role. On the web it's stored in an **httpOnly cookie** that expires after 2 hours. The mobile app receives a token and sends it in the Authorization header.

**Q: What prevents a resident from opening admin pages?**
A: `proxy.ts` checks every request. It verifies the JWT signature and compares the user's role to the route's allowed roles. If the role doesn't match, the user is redirected. Since the token is signed, a user cannot edit their role without invalidating it.

**Q: Can someone fake a QR code?**
A: QR codes contain a random UUID, not a sequential ID, so they're practically impossible to guess. The server also checks the token exists in the database, the account is active, and visitor passes haven't expired.

**Q: How do you prevent SQL injection?**
A: All database access goes through Prisma, which uses parameterized queries. User input is also validated with Zod before it reaches the database.

**Q: How do you protect API keys and secrets?**
A: Secrets (database URL, JWT secret, Cloudinary secret) are stored in a `.env` file excluded from Git. Image uploads go through our server so the Cloudinary secret is never sent to the browser.

**Q: What if a guard's phone is stolen?**
A: The mobile token expires after 7 days, and the admin can deactivate the guard's account. *(Improvement: add token revocation / shorter expiry.)*

### C. Features & Logic

**Q: How does the visitor process work?**
A: A resident submits a visitor request with the visitor's name, purpose, and expected time. The system generates a visitor QR pass valid for 24 hours. At the gate, the guard scans it; the system checks it's not expired, rejected, or cancelled, logs the check-in, and marks the request approved.

**Q: What happens if a guard scans check-out without a check-in?**
A: The system rejects it. Before logging a check-out, it checks that the person's most recent log is a check-in. This keeps logs accurate.

**Q: How do you handle room capacity?**
A: Each room has a `capacity` and `status`. When assigning a resident, the system checks the number of active assignments against capacity and updates the status (Available, Occupied, Full). Rooms under Maintenance or Unavailable can't be assigned.

**Q: What happens when a resident moves out?**
A: We don't delete the assignment. We set `vacated_at` and mark it inactive, preserving history for reports and audits.

**Q: Why not delete users?**
A: Deleting would break access log records. We deactivate users (`is_active = false`) instead, which blocks login and QR scans but keeps history.

**Q: What does the admin dashboard show?**
A: Live statistics — totals for residents, rooms, occupancy, visitors — and charts of check-in/check-out activity, built with Recharts.

**Q: Why use Cloudinary instead of saving images in the database or server?**
A: Images stored in the database make it large and slow. Cloudinary is a CDN that stores, compresses, and serves images quickly. We only store the URL.

### D. Mobile App

**Q: How does the mobile app connect to the system?**
A: It uses REST API endpoints under `/api/mobile/` (login, scan, logs, visitors, profile). It authenticates with a JWT bearer token and receives JSON responses.

**Q: Why a separate mobile app for guards?**
A: Guards need to scan QR codes quickly using a phone camera at the gate. A mobile app is more practical than a laptop at the entrance.

**Q: Does it work offline?**
A: No — it needs an internet connection so scans are validated and logged in real time. *(Future improvement: offline queue that syncs later.)*

### E. Database

**Q: Explain your ERD / table relationships.**
A: A **User** can have many **RoomAssignments**; each assignment belongs to one **Room**. A Resident User can create many **VisitorRequests**, each linked to exactly one **Visitor**. **AccessLogs** reference either a User or a Visitor, and always reference the Guard who scanned.

**Q: Is your database normalized?**
A: Yes. Each entity has its own table, and relationships use foreign keys instead of repeating data. For example, room details are stored once in `Room`, not copied into every user.

**Q: Why use indexes?**
A: Access logs grow quickly. Indexes on `timestamp`, `user_id`, and `visitor_id` make filtering and searching logs fast.

### F. Limitations & Future Work

**Q: What are the limitations of your system?**
A:
- Requires internet connection for scanning
- No email/SMS notifications for visitor approvals yet
- Mobile app is Android only (APK)
- No billing/payment module for dorm fees

**Q: What would you improve?**
A: Add SMS/email notifications, payment and billing tracking, an iOS version, offline scanning with sync, maintenance request tickets, and exportable reports (PDF/Excel).

**Q: How would the system scale with more users?**
A: Next.js can be deployed on serverless platforms that scale automatically, PostgreSQL handles large datasets well with indexes, and Cloudinary serves images through a CDN. Prisma uses a connection pool to manage database connections.

### G. Testing & Development

**Q: How did you test the system?**
A: We used seeded test data (`prisma/seed.ts`), manually tested each role's workflow (admin, guard, resident), tested edge cases like expired visitor passes and check-out without check-in, and validated inputs with Zod.

**Q: What development tools did you use?**
A: VS Code, Git/GitHub for version control, ESLint for code quality, Prisma CLI for database management, and npm for packages.

---

## 7. Quick Tips for the Defense

- Know the **flow** end-to-end: Admin → Resident → Visitor → Guard → Logs.
- Be ready to **demo**: login per role, add a user, assign a room, request a visitor, scan a QR.
- If you don't know an answer, explain what you **would** do and frame it as **future work**.
- Point to real files when asked "where is this in the code": `proxy.ts`, `prisma/schema.prisma`, `lib/actions/`, `app/api/mobile/scan/route.ts`.
