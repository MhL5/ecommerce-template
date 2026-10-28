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
| `/products/[slug]` | Gallery, price and stock, option picker for products with variants (the choice is kept in `?variant=`), add to cart, save to wishlist, description / specs / reviews tabs (signed-in shoppers can write a review, published after admin approval), related products |
| `/wishlist` | Saved products (no account needed) |
| `/cart` | Line items, quantity changes, totals, free-shipping progress. There's also a mini cart in the header, and every product card has a quick-add button |
| `/checkout` | Contact, address (signed-in shoppers can pick a saved address or save a new one), delivery, discount code and test-card payment, validated with zod |
| `/checkout/success?order=…` | Order confirmation |
| `/login`, `/register` | Mock auth |
| `/account`, `/account/orders` | Profile (edit name, change password), stats and order history with a status timeline; processing orders can be cancelled |
| `/account/addresses` | Address book: add, edit, delete, pick the default used at checkout |

### Admin panel (`/admin`, admin account only)

| Route | What it does |
| --- | --- |
| `/admin` | Dashboard: revenue / orders / average order / customers with change vs the previous 30 days, a 30-day revenue chart, orders by status, recent orders, low stock, best sellers |
| `/admin/products` | Add, edit, delete and feature products in a side-sheet form; "Reset catalog" undoes every change |
| `/admin/orders` | Filter by status, search, open an order and move it Processing → Shipped → Delivered (or cancel it) |
| `/admin/customers` | Accounts and guest shoppers with order count, total spent and last order |
| `/admin/reviews` | Moderation queue: publish, reject or delete reviews written by shoppers |
| `/admin/discounts` | Create, edit, switch off and delete promo codes, with start/end dates, a minimum subtotal and a usage limit; usage is counted from orders |

Admin changes show up in the shop straight away: new products get their own pages, edits change prices and stock, and deleted products disappear from listings, carts and wishlists.

### Demo accounts and codes

| Role | Email | Password |
| --- | --- | --- |
| Customer | `demo@northstar.test` | `demo1234` |
| Admin | `admin@northstar.test` | `admin1234` |

The login page has buttons that fill these in. At checkout, use the test card `4242 4242 4242 4242` with any future expiry and any CVC (the "Use test card" button fills it in). Discount codes (the admin can change these under Discounts):

| Code | Effect |
| --- | --- |
| `WELCOME10` | 10% off |
| `FREESHIP` | Free shipping on any delivery speed |
| `SAVE20` | $20 off orders of $100 or more |

## How it's put together

- **Feature folders**: `src/features/<feature>/{api,components,hooks,types,utils}` for `products`, `cart`, `checkout`, `orders`, `auth`, `account`, `addresses`, `reviews`, `wishlist`, `admin`, `home` and `layout`. Route files in `src/app` stay thin, and the shared shadcn components live in `src/components/ui`. Shop pages sit in the `src/app/(shop)` route group (header and footer); the admin has its own sidebar layout in `src/app/admin`.
- **Mock data**: the catalogue lives in `src/features/products/api/data`, users (two demo logins plus eight background shoppers) in `src/features/auth/api/data/users.ts`, the order history (about 40 generated orders) in `src/features/orders/api/data/seed-orders.ts`, shopper reviews waiting for moderation in `src/features/reviews/api/data/seed-reviews.ts`, and discount codes in `src/features/checkout/api/data/discount-codes.ts`.
- **Browser state**: the cart, wishlist, session, registered users, profile edits, placed orders, order status changes (with their history), saved addresses, shopper reviews, discount codes and admin catalogue edits are kept in `localStorage` through `src/lib/createLocalStore.ts`, using `useSyncExternalStore` with zod validation. To start over, clear the site's storage.
- **Catalogue = base + overrides**: the server renders the base data. Admin edits are stored as overrides (`src/features/products/api/catalog-store.ts`) that client components merge in after hydration.
- **Product images**: generated SVGs in `public/`. To regenerate them, run `pnpm generate:images`.
- **Variants**: a few products (Classic Organic Cotton Tee, Merino Crew Sweater, Trail Running Shoes) come in options such as Color and Size, like the `product_variant` table. Each variant has its own stock and SKU; `product.stock` is their sum. Cart lines and order items keep the variant, and the admin edits stock per variant. Other products have no options.

## Database

The schema lives in `src/db/schema` (Drizzle, Postgres 15+), and `docs/adr/0001-product-variants-and-attributes.md` explains the product model. The app doesn't read from the database yet. Set `NEXT_DATABASE_URL` in `.env`, then:

```bash
pnpm db:migrate
pnpm db:seed
```

`pnpm db:seed` turns the mock data into rows: categories, brands, the 36 products with their variants, images and spec attributes, reviews, discount codes, shipping methods, users and the ~40 seeded orders (with items, payments and status history). Ids are deterministic, so seeding again gives the same ids. It refuses to run if the database already has products; `pnpm db:seed --reset` truncates every table first. Users are created without passwords: Better Auth will own credentials once it's added. `pnpm db:generate` makes a migration after a schema change and `pnpm db:studio` opens Drizzle Studio.

`PROGRESS.md` records the decisions and the build log, and `TODO.md` is the task checklist.
