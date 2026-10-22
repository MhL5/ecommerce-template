"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import {
  AdminProductTable,
  type ProductChange,
} from "@/features/admin/components/AdminProductTable";
import { AdminSkeleton } from "@/features/admin/components/AdminSkeleton";
import { AdminStats } from "@/features/admin/components/AdminStats";
import { ProductFormSheet } from "@/features/admin/components/products/ProductFormSheet";
import { ProductRowActions } from "@/features/admin/components/products/ProductRowActions";
import { ResetCatalogButton } from "@/features/admin/components/products/ResetCatalogButton";
import {
  type StockFilter,
  filterAdminProducts,
  getInventoryStats,
} from "@/features/admin/utils/stats";
import { useSession } from "@/features/auth/hooks/use-session";
import { getCategories } from "@/features/products/api";
import {
  catalogStore,
  useCatalog,
} from "@/features/products/api/catalog-store";
import type { Product } from "@/features/products/types";
import { pluralize } from "@/lib/format";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const stockOptions: { value: StockFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Low" },
  { value: "out-of-stock", label: "Out" },
];

const categories = getCategories();
const categoryNames = Object.fromEntries(
  categories.map((category) => [category.id, category.name]),
);
const categoryItems = [
  { value: null, label: "All categories" },
  ...categories.map((category) => ({
    value: category.id as string | null,
    label: category.name,
  })),
];

type SheetState = {
  open: boolean;
  product: Product | null;
  /** Bumped per open so the form remounts with fresh values. */
  key: number;
};

/** Reads `?edit=<id>` (deep links from the dashboard), so it renders in Suspense. */
function AdminProducts() {
  const { isAdmin } = useSession();
  const router = useRouter();
  const editParam = useSearchParams().get("edit");
  const products = useCatalog();
  const overrides = catalogStore.useStore();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [stock, setStock] = useState<StockFilter>("all");
  const [sheet, setSheet] = useState<SheetState>({
    open: false,
    product: null,
    key: 0,
  });
  const [handledParam, setHandledParam] = useState<string | null>(null);

  // Open the editor for `?edit=` once the catalogue (and session) is ready.
  if (isAdmin && editParam && editParam !== handledParam) {
    const target = products.find((product) => product.id === editParam);
    setHandledParam(editParam);
    if (target) setSheet({ open: true, product: target, key: sheet.key + 1 });
  }

  // AdminShell handles redirects and access; wait for a confirmed admin.
  if (!isAdmin) return <AdminSkeleton />;

  const visible = filterAdminProducts(products, { search, categoryId, stock });
  const filtered = search !== "" || categoryId !== null || stock !== "all";
  const changes: Record<string, ProductChange> = {
    ...Object.fromEntries(
      Object.keys(overrides.updated).map((id) => [id, "edited" as const]),
    ),
    ...Object.fromEntries(
      overrides.created.map((product) => [product.id, "new" as const]),
    ),
  };

  function openSheet(product: Product | null) {
    setSheet((current) => ({ open: true, product, key: current.key + 1 }));
  }

  function onSheetOpenChange(open: boolean) {
    setSheet((current) => ({ ...current, open }));
    if (!open && editParam)
      router.replace("/admin/products", { scroll: false });
  }

  function resetFilters() {
    setSearch("");
    setCategoryId(null);
    setStock("all");
  }

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Add, edit and remove products. Changes show up in the shop straight away."
        actions={
          <>
            <ResetCatalogButton />
            <Button onClick={() => openSheet(null)}>
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Add product
            </Button>
          </>
        }
      />

      <AdminStats stats={getInventoryStats(products)} />

      <Card className="gap-0 pb-0">
        <CardHeader className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>
            All products{" "}
            <span className="font-normal text-muted-foreground">
              (
              {filtered
                ? `${visible.length} of ${products.length}`
                : products.length}
              )
            </span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <InputGroup className="w-full sm:w-64">
              <InputGroupInput
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, brand, SKU…"
                aria-label="Search products"
              />
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              </InputGroupAddon>
            </InputGroup>
            <Select
              items={categoryItems}
              value={categoryId}
              onValueChange={(value) => setCategoryId(value)}
            >
              <SelectTrigger className="w-44" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categoryItems.map((item) => (
                    <SelectItem key={item.label} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <ToggleGroup
              variant="outline"
              size="sm"
              spacing={0}
              value={[stock]}
              onValueChange={(value) => {
                const next = value[0] as StockFilter | undefined;
                if (next) setStock(next);
              }}
              aria-label="Filter by stock"
            >
              {stockOptions.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {visible.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyTitle>No products match</EmptyTitle>
                <EmptyDescription>
                  {pluralize(products.length, "product")} in the catalogue, none
                  matching these filters.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <AdminProductTable
              products={visible}
              categoryNames={categoryNames}
              changes={changes}
              renderActions={(product) => (
                <ProductRowActions product={product} onEdit={openSheet} />
              )}
            />
          )}
        </CardContent>
      </Card>

      <ProductFormSheet
        key={sheet.key}
        product={sheet.product}
        open={sheet.open}
        onOpenChange={onSheetOpenChange}
      />
    </>
  );
}

export { AdminProducts };
