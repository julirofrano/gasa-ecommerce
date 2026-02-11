# CLAUDE.md — GASA E-Commerce

## Project

B2B e-commerce platform and client portal for Gases Aconcagua S.A. (GASA), a supplier of industrial gases and industrial supplies in Argentina. Next.js frontend consuming an existing Odoo ERP via JSON-RPC. See `project.md` for full spec.

**Product lines**: Industrial gases (oxygen, CO2, argon, nitrogen, etc.), gas containers/cylinders, and industrial supplies (welding equipment, safety gear, regulators, fittings, tools, and related consumables).

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **UI**: shadcn/ui (New York style) + Tailwind CSS v4
- **State**: Zustand (client UI state only — cart, filters, modals). Never cache Odoo data in Zustand.
- **Server state**: React Server Components + Server Actions preferred. TanStack Query only when client-side caching is genuinely needed.
- **Auth**: NextAuth.js v5 (Auth.js) with custom Odoo credentials provider
- **Payments**: MercadoPago SDK (Checkout Pro)
- **Backend**: Odoo JSON-RPC API (single source of truth for all business data)

## Commands

```bash
bun dev          # Start dev server
bun run build    # Production build
bun run lint     # ESLint
```

## Architecture Rules

1. **Odoo is the backend** — all CRUD goes through Odoo's API. No separate database.
2. **Server-first rendering** — RSC by default. Only `"use client"` when interactivity is required.
3. **API abstraction layer** — all Odoo RPC calls go through `/lib/odoo/`. No raw RPC calls in components or pages.
4. **Type safety** — define TypeScript interfaces for all Odoo models in `/lib/odoo/types.ts`.
5. **Sensitive operations** (payments, order creation, auth) must use Server Actions or API Routes only.
6. **Path alias**: `@/*` maps to project root (`./`).
7. **Parent company awareness** — Portal users are child contacts in Odoo. Commercial properties (pricelist, payment terms, credit limits, fiscal position) live on the **parent partner** (`parent_id`). When reading these properties for the logged-in user, always resolve to the parent company first. Use `partner.parent_id[0]` to get the parent ID when `parent_id` is set.

## Project Structure

```
app/                      # Next.js App Router pages
  (auth)/                 # Login, register, forgot-password
  (shop)/                 # Product listing, detail, categories
  (account)/              # Profile, orders, containers
  cart/                   # Cart page
  checkout/               # Checkout flow + success/failure/pending
  api/payments/webhook/   # MercadoPago IPN handler
components/
  ui/                     # shadcn/ui components
  layout/                 # Header, Footer, Nav
  products/               # ProductCard, ProductGrid, VariantSelector
  cart/                   # CartDrawer, CartItem, CartSummary
  checkout/               # CheckoutForm, AddressSelector, PaymentButton
  containers/             # ContainerCard, ContainerTimeline
  account/                # ProfileForm, OrderList, AddressBook
lib/
  odoo/                   # Odoo API client + model-specific modules
  mercadopago/            # MercadoPago SDK config, preferences, webhooks
  utils/                  # Formatting (ARS currency, dates), constants
stores/                   # Zustand stores (cart-store, ui-store)
types/                    # Shared application types
```

## Locale & Formatting

- UI language: **Spanish (Argentina)** — all labels, messages, errors in es-AR
- Currency: ARS only, format `$ 1.234,56` (dot = thousands, comma = decimal)
- Dates: es-AR locale

## Design System

**Swiss International** (International Typographic Style). Primary color `#0094BB`, used as the sole accent throughout the site.

### Core Principles

- **Font**: Inter (weights 400, 500, 700, 900) — set via `--font-inter` CSS variable
- **No rounded corners**: Global `border-radius: 0 !important` in `globals.css`
- **No shadows**: Global `box-shadow: none !important` in `globals.css`
- **Dark/Light theme**: Supports light/dark mode via `next-themes` (class-based, default: light)
- **Primary = black** (`--primary: #000000`), accent = `#0094BB` (used for hover states, links, section labels)

### Recurring Patterns

| Element          | Classes                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Primary Button   | `border-2 border-black bg-black text-white font-bold uppercase tracking-wide hover:border-[#0094BB] hover:bg-[#0094BB]` |
| Secondary Button | `border-2 border-black bg-white text-black font-bold uppercase tracking-wide hover:bg-black hover:text-white`           |
| Card/Panel       | `border-2 border-black bg-white md:border-4`                                                                            |
| Form Input       | `border-b-2 border-black bg-transparent focus:border-[#0094BB] focus:outline-none`                                      |
| Form Label       | `text-xs font-bold uppercase tracking-widest`                                                                           |
| Section Label    | `text-xs font-bold uppercase tracking-widest text-[#0094BB]`                                                            |
| Page Title       | `text-4xl font-black uppercase tracking-tighter md:text-5xl`                                                            |
| Text Link        | `text-[#0094BB] font-bold uppercase text-xs tracking-wide hover:text-black`                                             |
| Status Badge     | `bg-black text-white font-bold uppercase tracking-wide`                                                                 |
| Product Card     | `border-2 border-black md:border-4 hover:bg-[#0094BB] hover:text-white`                                                 |
| Dot indicator    | Add `.dot-indicator` class to preserve `border-radius: 9999px`                                                          |

### Color Palette

- Background: `#FFFFFF`
- Foreground: `#000000`
- Muted: `#F2F2F2`
- Muted foreground: `#666666`
- Accent: `#0094BB`
- MercadoPago brand: `#009ee3` (keep as-is for payment button)

## Key Conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Mobile-first responsive design
- WCAG 2.1 AA accessibility
- SEO: server-rendered product pages with meta tags, Open Graph, `Product` structured data
- Graceful Odoo API error handling with user-friendly messages

## Current Phase

**Phase 1 (MVP)**: Auth, product catalog, cart, MercadoPago checkout, order creation/history, basic profile.

**Phase 2**: Gas container tracking, container returns, SDS downloads, inline payments, invoice PDFs, admin dashboard, email notifications, advanced search.
