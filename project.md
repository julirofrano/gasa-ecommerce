# GASA E-Commerce & Client Portal — Project Brief

## Overview

Build a modern B2B e-commerce platform and client portal for Gases Aconcagua S.A. (GASA) using **Next.js 15 (App Router)** as the frontend, connected to an existing **Odoo ERP** backend via its JSON-RPC API. The platform serves wineries, industrial clients, and workshops in Argentina, allowing them to browse and purchase **industrial gases and industrial supplies**, place orders, track gas container status, and pay via MercadoPago.

**Product lines**:

- **Industrial gases**: Oxygen, CO2, argon, nitrogen, acetylene, and specialty gas mixtures — sold as refills or new cylinders.
- **Industrial supplies**: Welding equipment, safety gear (PPE), regulators, fittings, hoses, torches, cutting tools, and related consumables.

Odoo is the single source of truth for all business data (products, inventory, customers, orders, containers). The Next.js app is a headless frontend that consumes Odoo's API — **do not use Strapi or any additional CMS**.

---

## Tech Stack

| Layer                | Technology                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Package Manager**  | Bun (exclusively — no npm/yarn/pnpm)                                                                                                   |
| **Framework**        | Next.js 15 with App Router                                                                                                             |
| **Language**         | TypeScript (strict mode)                                                                                                               |
| **UI Components**    | shadcn/ui + Tailwind CSS v4                                                                                                            |
| **State Management** | Zustand (client state only)                                                                                                            |
| **Server State**     | React Server Components + Server Actions preferred; use TanStack Query only where client-side caching/revalidation is genuinely needed |
| **Auth**             | NextAuth.js v5 (Auth.js) with custom Odoo credentials provider                                                                         |
| **Payments**         | MercadoPago SDK (Checkout Pro / Checkout API)                                                                                          |
| **Backend/API**      | Odoo JSON-RPC / XML-RPC API (existing instance)                                                                                        |
| **Deployment**       | Vercel (recommended) or self-hosted Node/Bun server                                                                                    |

---

## Architecture Principles

1. **Odoo as the backend**: All CRUD operations go through Odoo's API. No separate database. The Next.js app is stateless — it reads from and writes to Odoo.
2. **Server-first rendering**: Use React Server Components (RSC) by default. Only mark components `"use client"` when interactivity is required (forms, modals, cart, filters).
3. **Zustand for UI/client state only**: Cart state, UI toggles, filter selections. Never duplicate Odoo data in Zustand — fetch it fresh or cache with RSC/TanStack Query.
4. **Type safety end-to-end**: Define TypeScript interfaces for all Odoo models consumed by the frontend (products, orders, partners, containers).
5. **API abstraction layer**: Create a `/lib/odoo/` module that wraps all Odoo RPC calls. No raw RPC calls in components or pages. This layer handles session management, error handling, and response typing.
6. **Bun only**: All scripts, installs, and dev commands must use `bun`. Configure CI/CD accordingly.

---

## Core Modules

### 1. Authentication & Accounts

**Odoo integration**: Authenticate against `res.partner` / `res.users` via Odoo's `/web/session/authenticate` endpoint.

- **Sign up**: Registration form → creates a `res.partner` (portal user) in Odoo.
- **Login**: Email + password validated against Odoo. On success, store Odoo session ID + user data in a NextAuth JWT.
- **Session management**: NextAuth handles the frontend session. Odoo session ID is stored server-side (in the JWT or encrypted cookie) for subsequent API calls.
- **Password recovery**: Trigger Odoo's password reset flow or implement a custom token-based flow via Server Actions.
- **Account profile**: View/edit company info, tax ID (CUIT), shipping addresses, billing addresses — all synced to `res.partner` fields in Odoo.
- **Role-based access**: Support at minimum two roles: `customer` (portal user) and `admin` (internal user). Admins get access to an internal dashboard (future scope).

### 2. Product Catalog

**Odoo models**: `product.template`, `product.product` (variants), `product.category`.

- **Product listing page**: Grid/list view with filters (category, gas type, container size, supply type, availability). Server-rendered with pagination. Must handle both gas products and industrial supplies seamlessly.
- **Product detail page**: Full product info, variant selector, images (fetched from Odoo attachments), pricing, stock availability. Gas products show container/cylinder details; supplies show standard product specs.
- **Product variants**: Handle Odoo's `product.template` → `product.product` relationship. Variants may represent different container sizes, gas purities, packaging options, or supply product sizes/models. Display variant attributes as selectable options (dropdowns, buttons).
- **Categories**: Hierarchical categories synced from `product.category`. Support nested navigation.
- **Pricing**: Display prices from Odoo's `product.pricelist` based on the logged-in customer's assigned pricelist. Support quantity-based price breaks if configured in Odoo.
- **Search**: Full-text search with debounced input. Search against product name, description, and internal reference.

### 3. Gas Products & Container Tracking (Domain-Specific)

This is the key differentiator. The platform must surface data from a **custom Odoo module** for gas container management (`gas.container`, or whatever model name is defined).

- **My Containers**: Authenticated users can see a list of gas containers currently assigned to them (on loan, in use). Show container serial number, gas type, status (full, empty, in transit, in maintenance), last fill date, next service date.
- **Container history**: Timeline of movements/events per container.
- **Reorder gas refill**: One-click reorder for a container refill — pre-fills an order with the correct product variant based on the container's gas type and size.
- **Container return request**: Submit a return/pickup request for empty containers.
- **Safety data sheets (SDS)**: Download PDF safety sheets linked to each gas product (stored as Odoo attachments).

> **Note to developer**: The exact Odoo model names and field names for the gas container module will be provided. Build the frontend integration layer to be adaptable to the final schema.

### 4. Shopping Cart & Checkout

- **Cart**: Client-side state managed with Zustand. Persisted to `localStorage` for guest users. For authenticated users, optionally sync to an Odoo `sale.order` in `draft` state.
- **Cart items**: Product variant, quantity, unit price, subtotal. Support both regular products and gas refill orders.
- **Checkout flow** (multi-step):
  1. **Cart review**: Edit quantities, remove items, see totals.
  2. **Shipping / delivery**: Select delivery address (from account addresses) or add new. Select delivery method if applicable.
  3. **Payment**: MercadoPago integration (see below).
  4. **Confirmation**: Order summary + order number (from Odoo `sale.order`).
- **Guest checkout**: Allow placing orders without an account (create a minimal `res.partner` in Odoo on order submission).
- **Order notes**: Free-text field for special instructions (e.g., "deliver to warehouse B, gate 3").

### 5. Orders & Order History

- **Create order**: On checkout completion, create a confirmed `sale.order` in Odoo with all line items, customer reference, shipping address, and payment reference.
- **Order history**: List of past orders with status (draft, confirmed, shipped, delivered, invoiced). Pulled from `sale.order` via Odoo API.
- **Order detail**: Line items, totals, payment status, shipping tracking (if available), linked invoices.
- **Reorder**: Duplicate a past order into the cart.
- **Invoice download**: Fetch and serve PDF invoices from Odoo (`account.move` attachments).

### 6. Payments — MercadoPago

**Integration type**: MercadoPago Checkout Pro (redirect-based) as the primary method. Optionally support Checkout API (transparent/inline) for a seamless UX in a future phase.

- **Flow**:
  1. User completes checkout → Next.js Server Action creates a MercadoPago `preference` with order details (items, amounts in ARS, payer info).
  2. User is redirected to MercadoPago's hosted checkout page.
  3. On success/failure/pending, MercadoPago redirects back to designated callback URLs in the Next.js app.
  4. **Webhook**: MercadoPago sends IPN (Instant Payment Notification) to a Next.js API route (`/api/payments/webhook`). This route validates the payment and updates the Odoo `sale.order` (confirm payment, register `account.payment`).
- **Currency**: Argentine Pesos (ARS) only.
- **Payment methods supported via MercadoPago**: Credit/debit cards, bank transfers, cash (Rapipago/PagoFácil) — all handled by MercadoPago's UI.
- **Security**: Validate webhook signatures. Never expose MercadoPago access tokens client-side. All payment logic in Server Actions or API Routes.

---

## Project Structure

```
gasa-ecomm/
├── bun.lockb
├── bunfig.toml
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                    # Odoo URL, credentials, MercadoPago keys
├── public/
│   └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Home / landing
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (shop)/
│   │   │   ├── products/page.tsx           # Product listing
│   │   │   ├── products/[slug]/page.tsx    # Product detail
│   │   │   └── categories/[slug]/page.tsx  # Category view
│   │   ├── (account)/
│   │   │   ├── profile/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── containers/page.tsx         # Gas container tracking
│   │   │   └── containers/[id]/page.tsx    # Container detail/history
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── checkout/success/page.tsx
│   │   ├── checkout/failure/page.tsx
│   │   ├── checkout/pending/page.tsx
│   │   └── api/
│   │       └── payments/
│   │           └── webhook/route.ts        # MercadoPago IPN handler
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/               # Header, Footer, Sidebar, Nav
│   │   ├── products/             # ProductCard, ProductGrid, VariantSelector, etc.
│   │   ├── cart/                 # CartDrawer, CartItem, CartSummary
│   │   ├── checkout/             # CheckoutForm, AddressSelector, PaymentButton
│   │   ├── containers/           # ContainerCard, ContainerTimeline, RefillButton
│   │   └── account/              # ProfileForm, OrderList, AddressBook
│   ├── lib/
│   │   ├── odoo/
│   │   │   ├── client.ts         # Odoo JSON-RPC client (session, auth, call)
│   │   │   ├── products.ts       # Product-related API calls
│   │   │   ├── orders.ts         # Order-related API calls
│   │   │   ├── partners.ts       # Customer/partner API calls
│   │   │   ├── containers.ts     # Gas container API calls
│   │   │   └── types.ts          # TypeScript interfaces for Odoo models
│   │   ├── mercadopago/
│   │   │   ├── client.ts         # MercadoPago SDK config
│   │   │   ├── preferences.ts    # Create payment preferences
│   │   │   └── webhooks.ts       # Webhook validation & processing
│   │   └── utils/
│   │       ├── formatting.ts     # Price formatting (ARS), dates, etc.
│   │       └── constants.ts
│   ├── stores/
│   │   ├── cart-store.ts         # Zustand cart store
│   │   └── ui-store.ts           # UI state (sidebar open, modals, filters)
│   ├── hooks/
│   │   └── ...                   # Custom hooks if needed
│   ├── types/
│   │   └── index.ts              # Shared application types
│   └── middleware.ts             # Auth middleware (protect /account/*, /checkout)
```

---

## Environment Variables

```env
# Odoo
ODOO_URL=https://your-odoo-instance.com
ODOO_DB=your_database_name
ODOO_USERNAME=api_user@company.com
ODOO_PASSWORD=api_user_password

# NextAuth
NEXTAUTH_SECRET=random_secret_key
NEXTAUTH_URL=http://localhost:3000

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxx
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxx
```

---

## Non-Functional Requirements

- **Language**: The UI must be in **Spanish (Argentina)**. All labels, messages, error texts, dates, and currency formatting must use es-AR locale. Price format: `$ 1.234,56` (dot as thousands separator, comma as decimal).
- **Responsive**: Mobile-first responsive design. Must work well on phones (winery staff use mobile devices on-site).
- **Performance**: Target Lighthouse score > 90 on mobile. Use Next.js image optimization, dynamic imports for heavy components, and RSC to minimize client bundle.
- **SEO**: Product pages must be server-rendered with proper meta tags, Open Graph data, and structured data (`Product` schema).
- **Error handling**: Graceful error states for Odoo API failures (show user-friendly messages, retry options). Log errors server-side.
- **Security**: All sensitive operations (payments, order creation, auth) via Server Actions or API Routes. Sanitize all user inputs. CSRF protection via NextAuth.
- **Accessibility**: Follow WCAG 2.1 AA guidelines. shadcn/ui components already handle most a11y concerns — ensure custom components follow suit.

---

## Development Guidelines

1. **Initialize project**: `bunx create-next-app@latest gasa-ecomm --typescript --tailwind --eslint --app --src-dir`
2. **Install shadcn/ui**: `bunx shadcn@latest init` — use "New York" style, neutral base color, CSS variables enabled.
3. **State management**: Install Zustand (`bun add zustand`). Use it only for client-side UI state (cart, filters, modals). Never cache Odoo data in Zustand.
4. **Odoo client**: Build a reusable `OdooClient` class in `/lib/odoo/client.ts` that handles JSON-RPC calls, session management, and error wrapping. All other Odoo modules import from this client.
5. **Commit conventions**: Use conventional commits (`feat:`, `fix:`, `chore:`, etc.).
6. **Testing**: Add tests for critical paths — Odoo API client, cart store, checkout flow, webhook validation.

---

## Phase 1 Scope (MVP)

Focus on delivering these features first:

1. ✅ Auth (login, register, session management with Odoo)
2. ✅ Product catalog (listing, detail, variants, search, categories)
3. ✅ Cart (add/remove/update, persistent client-side)
4. ✅ Checkout with MercadoPago Checkout Pro
5. ✅ Order creation in Odoo + payment webhook handling
6. ✅ Order history (list + detail)
7. ✅ Basic account profile (view/edit)

## Phase 2 (Post-MVP)

1. 🔲 Gas container tracking portal (My Containers, history, reorder refill)
2. 🔲 Container return requests
3. 🔲 SDS document downloads
4. 🔲 MercadoPago Checkout API (inline/transparent payments)
5. 🔲 Invoice PDF downloads from Odoo
6. 🔲 Admin dashboard (internal users)
7. 🔲 Email notifications (order confirmation, shipping updates)
8. 🔲 Advanced search with faceted filters
