# Next.js E-Commerce Architect Memory

## Project Structure

- `/components/shop/` — Client components for shop-related features (product listings, filters, etc.)
- `/components/account/` — Client components for account pages (orders, invoices, containers)
- `/hooks/` — React Query hooks for data fetching (`use-products.ts`, `use-categories.ts`, `use-containers.ts`, etc.)
- `/lib/query-keys.ts` — Centralized query key definitions for React Query
- `/lib/odoo/product-service.ts` — Server-side Odoo API functions (e.g., `getShopCategories`, `getShopProducts`)
- `/lib/data/products.ts` — Pure client/server functions for gas formulas and product calculations
- `/types/api.ts` — API response type definitions (e.g., `ContainerDetailResponse`, `OrderDetailResponse`)

## React Query Patterns

### Thin RSC Shell Pattern (Protected Pages)

For protected account pages without search params or prefetching needs:

1. **RSC page** — minimal, only metadata + render client component
2. **Client component** — all data fetching via React Query hooks
3. **API route** handles auth + ownership verification

Example:

```tsx
// app/(account)/invoices/[id]/page.tsx (RSC)
import type { Metadata } from "next";
import { getInvoiceById } from "@/lib/odoo/invoices";
import { InvoiceDetailContent } from "@/components/account/invoice-detail-content";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const invoice = await getInvoiceById(Number(id));
  return {
    title: invoice ? invoice.name : `Factura #${id}`,
    robots: { index: false, follow: false },
  };
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  return <InvoiceDetailContent id={Number(id)} />;
}

// components/account/invoice-detail-content.tsx (Client)
("use client");
export function InvoiceDetailContent({ id }: { id: number }) {
  const { data, isLoading } = useInvoiceDetail(id);
  if (isLoading) return <LoadingSkeleton />;
  if (!data) return <NotFound />;
  // ... render invoice + lines
}
```

Use this pattern when:

- No SSR prefetching needed (account pages behind auth)
- No search params to process
- Client-side data fetching is acceptable
- Auth + ownership checks happen in API route (not RSC)

### Prefetch + HydrationBoundary Pattern

When migrating Server Components to use React Query:

1. **Server Component (RSC page)**:
   - Create `QueryClient` instance
   - Prefetch queries in parallel with `Promise.all`
   - Wrap client component in `HydrationBoundary` with dehydrated state
   - Keep `metadata` export and server-only components (e.g., SEO `BreadcrumbJsonLd`)

2. **Client Component** (`"use client"`):
   - Use React Query hooks (`useProducts`, `useCategories`)
   - No props needed — reads from React Query cache
   - Contains all interactive UI logic

Example:

```tsx
// app/(shop)/products/page.tsx (RSC)
const queryClient = new QueryClient();
await Promise.all([
  queryClient.prefetchQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => getShopCategories(),
  }),
  queryClient.prefetchQuery({
    queryKey: queryKeys.products.list({ limit: 500 }),
    queryFn: () => getShopProducts({ limit: 500 }),
  }),
]);

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <div>
      <BreadcrumbJsonLd items={[...]} />
      <ProductsContent />
    </div>
  </HydrationBoundary>
);

// components/shop/products-content.tsx (Client)
"use client";
export function ProductsContent() {
  const { data: categories = [] } = useCategories();
  const { data: allProducts = [] } = useProducts({ limit: 500 });
  // ... render logic
}
```

### Server-Side Pagination with React Query

For pages with server-controlled pagination via `searchParams`:

**RSC responsibilities:**

- Calculate safe page boundaries from `searchParams.page`
- Prefetch data for the calculated page
- Pass minimal props to client component (e.g., `slug`, `id`)

**Client component:**

- Use `useSearchParams()` from `next/navigation` to read current page
- Use same pagination calculation logic as server
- React Query hooks automatically read prefetched data
- Pagination `Link` components trigger server re-render with new page param

Example (category page with pagination):

```tsx
// RSC calculates safe page
const safePage = Math.min(currentPage, totalPages);
const offset = (safePage - 1) * PRODUCTS_PER_PAGE;

await queryClient.prefetchQuery({
  queryKey: queryKeys.products.list({
    limit: PRODUCTS_PER_PAGE,
    offset,
    categoryId,
  }),
  queryFn: () =>
    getShopProducts({ limit: PRODUCTS_PER_PAGE, offset, categoryId }),
});

// Client component reads page from URL
const searchParams = useSearchParams();
const page = searchParams.get("page");
const safePage = Math.min(Number(page) || 1, totalPages);
```

### Query Keys Convention

- Defined in `/lib/query-keys.ts`
- Use factory pattern: `queryKeys.products.list(params)`
- Always pass same params to `queryKey` and API call for cache consistency

## Product Display Patterns

### Gas vs Supply Products

- **Gas products** (`type === "gas"`):
  - Show chemical formula via `getGasFormula(product.id)` from `/lib/data/products`
  - Display purity if available
  - No image, use formula as visual identifier

- **Supply products** (`type !== "gas"`):
  - Show product image with Next.js `Image` component
  - Display brand, description
  - Fallback to SKU if no image

### Component Organization

- Keep design system classes consistent (see CLAUDE.md for button/card patterns)
- Use `ROUTES` constant from `/lib/utils/constants` for all internal links
- Mobile-first responsive design with sticky sidebars on desktop
