# 0001 — Products, variants and attributes

Status: accepted (2026-10-29)

## Context

The shop must sell any kind of product without schema changes: a T-shirt in Red/XL, a laptop in 16 GB/512 GB, a lamp with no choices at all. Products also carry descriptive facts (Material, Weight, Wattage) that customers filter on but that don't create separate stock.

## Decision

Two separate mechanisms, because they answer different questions:

**Options and variants: "which one do I buy?"**

- `product_option`: an axis the product varies on (Color, Size). Defined per product.
- `product_option_value`: a choice on that axis (Red, XL), with an optional swatch.
- `product_variant`: one row per sellable combination. It owns the SKU, price, compare-at price, cost, stock, backorder flag and weight.
- `product_variant_option_value`: which value a variant has for each option. The primary key `(variant_id, option_id)` allows one value per option, and a composite foreign key makes sure that value belongs to that option.
- A product with no options still gets exactly one variant with `is_default = true` (a partial unique index allows only one per product). So price and stock **always** live on the variant, and cart/order lines **always** point at a variant.

**Attributes: "what is it like?"**

- `attribute`: defined once for the whole shop, typed (`text`, `number`, `boolean`, `select`, `multiselect`) with an optional unit and an `is_filterable` flag for listing facets.
- `attribute_option`: allowed values for `select` / `multiselect`.
- `product_attribute_value`: the value on a product, or on a single variant when `variant_id` is set. Exactly one of `value_text` / `value_number` / `value_boolean` / `option_id` is set (check constraint). Multiselect stores one row per chosen option.
- `category_attribute`: which attributes a category suggests or requires, so the admin form can offer the right fields.

Anything that fits neither goes in `product.metadata` (jsonb).

## Consequences

- No migration is needed to add a new kind of product, option or attribute.
- Filtering by attribute is an indexed join (`attribute_id, option_id` / `attribute_id, value_number`), not a jsonb scan.
- Listing pages need the price range per product: aggregate `min(price)` over active variants (or cache it on the product later if it becomes slow).
- Changing a product's options means regenerating its variants. The admin UI has to handle this.
- `NULLS NOT DISTINCT` on `product_attribute_value` needs Postgres 15+.
- Alternative rejected: a single jsonb `attributes` column. It is easier to write, but untyped, hard to filter or index well, and it lets "Material" be spelled five ways.
