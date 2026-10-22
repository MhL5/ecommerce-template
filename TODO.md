# Ecommerce MVP — TODO

Mock data only (local TS files), no real backend or payments. Client-side state (cart, session, orders) persists in `localStorage`.

## Foundation
- [x] Install required shadcn components (card, badge, input, field, select, checkbox, radio-group, slider, sheet, dropdown-menu, separator, skeleton, table, tabs, empty, alert, sonner/toast, breadcrumb, pagination, avatar, label, toggle-group, spinner, input-group, accordion, scroll-area, tooltip)
- [x] Add `Link` and `Img` wrappers in `src/components/ui` (required by ESLint rules)
- [x] Add shared helpers: price formatting, `createLocalStore` (localStorage + useSyncExternalStore)
- [x] Generate product images (SVG) in `public/products`

## Catalog (products feature)
- [x] Define product/category types
- [x] Create mock product + category data (36 products, 6 categories)
- [x] Data API: get all, get by slug, featured, related, categories, brands
- [x] Query utils: search, filter (category, brand, price, rating, in-stock), sort, paginate, parse searchParams
- [x] ProductCard + ProductGrid + rating display components

## Layout
- [x] Site header (logo, nav, search, cart button, user menu, theme toggle)
- [x] Mobile navigation sheet
- [x] Site footer
- [x] Root layout wiring, metadata, toaster
- [x] Not-found and error pages

## Home
- [x] Hero section
- [x] Category grid
- [x] Featured products + new arrivals sections
- [x] Value props / promo banner

## Product listing
- [x] `/products` route with Suspense-wrapped results reading searchParams
- [x] Search input synced to URL
- [x] Filters sidebar (category, brand, price range, rating, in stock) + mobile filters sheet
- [x] Sort select
- [x] Results summary, active filter chips, clear filters
- [x] Pagination
- [x] Empty state + loading skeleton

## Product detail
- [x] `/products/[slug]` route with generateStaticParams + metadata + notFound
- [x] Image gallery with thumbnails
- [x] Product info (price, compare-at, rating, stock badge, breadcrumb)
- [x] Quantity selector + add to cart
- [x] Tabs: description, specifications, reviews (mock)
- [x] Related products

## Cart
- [x] Cart store (add, update qty, remove, clear) persisted to localStorage
- [x] Cart count badge in header
- [x] Cart sheet (mini cart) from header
- [x] `/cart` page: line items, quantity controls, remove, summary
- [x] Cart totals util (subtotal, shipping, tax, total) + empty cart state

## Checkout (mock)
- [x] Checkout validation schema (zod)
- [x] `/checkout` page: contact + shipping address form
- [x] Shipping method options
- [x] Mock payment section (no real payment, test card only)
- [x] Order summary sidebar
- [x] Place order: create order, clear cart, redirect to confirmation

## Orders
- [x] Order types + order store persisted to localStorage
- [x] `/checkout/success` order confirmation page
- [x] Order details component (items, totals, address, status)

## Auth (mock)
- [x] Auth types + mock seeded users (customer + admin)
- [x] Session store (login, register, logout) persisted to localStorage
- [x] `/login` page with form + validation + demo credentials hint
- [x] `/register` page with form + validation
- [x] Client auth guard (redirect to login with return URL)
- [x] User menu in header reflects session

## Account
- [x] `/account` overview (profile card + recent orders)
- [x] `/account/orders` list with expandable order details
- [x] Account navigation

## Admin
- [x] Admin guard (admin role only)
- [x] `/admin/products` table (image, name, category, price, stock, status)
- [x] Admin search + category filter + stats cards

## Final
- [x] Lint passes (`pnpm lint`)
- [x] Full build passes, PROGRESS.md says ALL DONE

---

# Phase 2 — admin panel + gaps

Gaps found after Phase 1: the "admin" was only a read-only product list, product cards had no quick add, and there was no wishlist, discount codes, profile editing, order cancellation, sitemap/robots, or signed-in state in the mobile nav.

## Catalog overrides (admin changes reach the store)
- [x] Catalog store: created/updated/deleted product overrides in localStorage + merged catalog hooks
- [x] Storefront reads the merged catalog (grids, listing, PDP incl. admin-created products, cart)
- [x] Stock decrements when an order is placed (restored on cancel)

## Storefront additions
- [x] Quick "Add to cart" on product cards
- [x] Wishlist: heart toggle on cards + PDP, header link with count, `/wishlist` page
- [x] Discount codes at checkout (WELCOME10, FREESHIP, SAVE20) shown in totals and saved on orders
- [x] Listing header reflects the selected category (name + description)
- [x] Mobile nav shows sign-in / account state
- [x] `sitemap.xml` and `robots.txt`

## Account additions
- [x] Edit profile (name) and change password
- [x] Cancel an order while it's still processing

## Admin panel
- [x] Move shop routes into a `(shop)` route group so admin gets its own full-screen layout
- [x] Admin layout: shadcn Sidebar (Dashboard, Products, Orders, Customers, View store) + top bar
- [x] Seed realistic order history across several demo customers
- [x] Dashboard: KPI cards, revenue chart (last 30 days), orders by status, recent orders, low-stock list
- [x] Products: create / edit in a sheet form with validation
- [x] Products: delete (confirm dialog), toggle featured, reset catalog to defaults
- [x] Orders: table with status tabs + search, order detail sheet, change status
- [x] Customers: table with order count, total spent, last order

## Phase 2 final
- [x] Browser-test the new flows end to end
- [x] Lint + build pass, PROGRESS.md says ALL DONE
