# RMS — Restaurant Management System

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| UI Kit | shadcn/ui + Lucide React |
| Backend | Next.js API Routes (Serverless) |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js (Auth.js) with Credentials |
| Cache | Upstash Redis / Vercel KV |
| Storage | Cloudinary |
| Payments | Razorpay + Stripe |
| Monitoring | Sentry |
| Hosting | Vercel (Hobby) |

---

## Progress

### Phase 1: Foundation

- [x] Scaffold Next.js 16 project with App Router, TypeScript, Tailwind
- [x] Install core dependencies (mongoose, next-auth, bcryptjs, zod, stripe, etc.)
- [x] Install and configure shadcn/ui components
- [x] Set up project folder structure (features, lib, components, models, types, store)
- [x] Configure MongoDB/Mongoose connection
- [x] Set up NextAuth.js with credentials provider and JWT sessions
- [x] Create environment variable templates (.env.local, .env.example)
- [x] Configure middleware for role-based route protection
- [x] Create all Mongoose models (User, Restaurant, Table, MenuCategory, MenuItem, Order, Payment, Invoice, Ingredient, InventoryTransaction, AuditLog)
- [x] Create shared types and Zod validation schemas
- [x] Configure Next.js (images, serverExternalPackages)

### Phase 2: Core Features — _In Progress_

- [ ] Authentication pages (Login, Register)
- [ ] Auth API routes (sign-in, sign-up, session)
- [ ] Menu Management CRUD (categories, items, variants, add-ons)
- [ ] Menu Management API routes
- [ ] Table Management (floor layout, status colors, occupancy timer)
- [ ] Table Management API routes

### Phase 3: Order Flow

- [ ] Order placement API (with idempotency key)
- [ ] Waiter order screen (table selection, menu browsing, item adding)
- [ ] Order status management (ordered → preparing → ready → served)
- [ ] Add/Void item with reason capture
- [ ] KDS — Kitchen Display Screen (wall-mounted, touch-friendly)
- [ ] KDS real-time polling (1s interval)
- [ ] KDS item-level status and timer (yellow/red borders)
- [ ] Sound notification on new order

### Phase 4: Billing & Payments

- [ ] Auto-bill generation on all items served
- [ ] Manual line items for uncatalogued charges
- [ ] Discounts (flat/percentage) with reason code and approval threshold
- [ ] Split bill (by-item and equal split)
- [ ] GST auto-calculation per item category (5%, 12%, 18%, 28%)
- [ ] GST-compliant invoice generation
- [ ] 80mm thermal receipt print (ESC/POS via browser)
- [ ] Razorpay integration (UPI, cards, netbanking)
- [ ] Stripe integration (international cards)
- [ ] Offline payment mode with reference notes
- [ ] Refund flow (gateway + cash)
- [ ] Payment audit trail

### Phase 5: Inventory

- [ ] Ingredient CRUD
- [ ] Recipe mapping (menu item → ingredient quantities)
- [ ] Auto-deduction on order completion
- [ ] Manual wastage/adjustment entries
- [ ] Low-stock alerts (yellow < 20%, red < 10%)

### Phase 6: Analytics Dashboard

- [ ] KPI cards (today revenue, active orders, tables occupied, low stock, staff on duty)
- [ ] Revenue trend line chart (7 days)
- [ ] Order status breakdown (donut chart)
- [ ] Best-selling items (horizontal bar chart)
- [ ] Hourly order volume (bar chart)
- [ ] Date range filter
- [ ] PDF export
- [ ] Recent orders table (searchable, sortable)

### Phase 7: Polish & Launch

- [ ] QR menu pages (public, responsive)
- [ ] Thermal printer formatting
- [ ] Error, loading, and empty states for all screens
- [ ] Performance optimization (bundle size, Lighthouse ≥ 90)
- [ ] Security review (headers, rate limiting, input validation)
- [ ] Sentry error monitoring integration
- [ ] Deployment scripts / Docker Compose for self-hosting
- [ ] UAT handover

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # login, register
│   ├── (dashboard)/      # owner, waiter, chef, cashier
│   ├── api/v1/           # REST API routes
│   ├── layout.tsx
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn components
│   ├── shared/           # Shared UI components
│   └── features/         # Feature-specific components
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── db.ts             # MongoDB connection
│   ├── utils.ts          # Utilities
│   └── validations.ts    # Zod schemas
├── models/               # Mongoose models
├── types/                # TypeScript types
└── store/                # State management
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

## API Conventions

- Base URL: `/api/v1/`
- Response envelope: `{ success: boolean, data?: T, error?: string, meta?: object }`
- Pagination: cursor-based, response includes `meta.cursor` and `meta.hasNextPage`
- Auth: JWT via HTTP-only cookies (NextAuth.js)
