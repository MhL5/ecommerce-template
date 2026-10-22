# Ecommerce template

A demo storefront ("Northstar") with an admin panel, built with Next.js 16 (App Router, Cache Components) and shadcn/ui (Base UI). Everything runs on mock data: there's no backend and no real payments.

## Run it

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000. Use `pnpm build` for a production build and `pnpm lint` to lint. The repo requires pnpm, so `npm run …` is rejected by `devEngines`.

## What's in it

### Shop

| Route | What it does |
| --- | --- |
| `/` | Hero, value props, categories, featured products, sale banner, new arrivals |
| `/products` | Search, filters (category, brand, price, rating, stock, sale), sort and pagination, all kept in the URL. The heading follows the selected category, search or deals |
| `/products/[slug]` | Gallery, price and stock, add to cart, save to wishlist, description / specs / reviews tabs, related products |
| `/wishlist` | Saved products (no account needed) |
| `/cart` | Line items, quantity changes, totals, free-shipping progress. There's also a mini cart in the header, and every product card has a quick-add button |
| `/checkout` | Contact, address, delivery, discount code and test-card payment, validated with zod |
| `/checkout/success?order=…` | Order confirmation |
| `/login`, `/register` | Mock auth |
| `/account`, `/account/orders` | Profile (edit name, change password), stats and order history; processing orders can be cancelled |

### Admin panel (`/admin`, admin account only)

| Route | What it does |
| --- | --- |
| `/admin` | Dashboard: revenue / orders / average order / customers with change vs the previous 30 days, a 30-day revenue chart, orders by status, recent orders, low stock, best sellers |
| `/admin/products` | Add, edit, delete and feature products in a side-sheet form; "Reset catalog" undoes every change |
| `/admin/orders` | Filter by status, search, open an order and move it Processing → Shipped → Delivered (or cancel it) |
| `/admin/customers` | Accounts and guest shoppers with order count, total spent and last order |

Admin changes show up in the shop straight away: new products get their own pages, edits change prices and stock, and deleted products disappear from listings, carts and wishlists.

### Demo accounts and codes

| Role | Email | Password |
| --- | --- | --- |
| Customer | `demo@northstar.test` | `demo1234` |
| Admin | `admin@northstar.test` | `admin1234` |

The login page has buttons that fill these in. At checkout, use the test card `4242 4242 4242 4242` with any future expiry and any CVC (the "Use test card" button fills it in). Discount codes:

| Code | Effect |
| --- | --- |
| `WELCOME10` | 10% off |
| `FREESHIP` | Free shipping on any delivery speed |
| `SAVE20` | $20 off orders of $100 or more |

## How it's put together

- **Feature folders**: `src/features/<feature>/{api,components,hooks,types,utils}` for `products`, `cart`, `checkout`, `orders`, `auth`, `account`, `wishlist`, `admin`, `home` and `layout`. Route files in `src/app` stay thin, and the shared shadcn components live in `src/components/ui`. Shop pages sit in the `src/app/(shop)` route group (header and footer); the admin has its own sidebar layout in `src/app/admin`.
- **Mock data**: the catalogue lives in `src/features/products/api/data`, users (two demo logins plus eight background shoppers) in `src/features/auth/api/data/users.ts`, the order history (about 40 generated orders) in `src/features/orders/api/data/seed-orders.ts`, and discount codes in `src/features/checkout/api/data/discount-codes.ts`.
- **Browser state**: the cart, wishlist, session, registered users, profile edits, placed orders, order status changes and admin catalogue edits are kept in `localStorage` through `src/lib/createLocalStore.ts`, using `useSyncExternalStore` with zod validation. To start over, clear the site's storage.
- **Catalogue = base + overrides**: the server renders the base data. Admin edits are stored as overrides (`src/features/products/api/catalog-store.ts`) that client components merge in after hydration.
- **Product images**: generated SVGs in `public/`. To regenerate them, run `pnpm generate:images`.

`PROGRESS.md` records the decisions and the build log, and `TODO.md` is the task checklist.
