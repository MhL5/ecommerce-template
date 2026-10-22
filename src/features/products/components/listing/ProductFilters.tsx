"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useProductQuery } from "@/features/products/hooks/use-product-query";
import type { CategoryId } from "@/features/products/types";
import { countActiveFilters } from "@/features/products/utils/query";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

type FilterOptions = {
  categories: { id: CategoryId; name: string }[];
  brands: string[];
  categoryCounts: Record<string, number>;
  brandCounts: Record<string, number>;
  /** Slider bounds in cents. */
  priceRange: { min: number; max: number };
};

const ratingOptions = [
  { value: "any", label: "Any rating" },
  { value: "4.5", label: "4.5 & up" },
  { value: "4", label: "4.0 & up" },
  { value: "3", label: "3.0 & up" },
];

function toggle<T>(list: T[], value: T, checked: boolean) {
  return checked
    ? [...new Set([...list, value])]
    : list.filter((entry) => entry !== value);
}

function Count({ value }: { value: number | undefined }) {
  return (
    <span className="ms-auto text-xs text-muted-foreground tabular-nums">
      {value ?? 0}
    </span>
  );
}

function PriceFilter({ priceRange }: Pick<FilterOptions, "priceRange">) {
  const { query, setQuery } = useProductQuery();
  const current: [number, number] = [
    query.minPrice ?? priceRange.min,
    query.maxPrice ?? priceRange.max,
  ];
  const [value, setValue] = useState(current);
  const [synced, setSynced] = useState(current.join("-"));

  // Follow the URL when it changes elsewhere (chips, clear all, back button).
  if (current.join("-") !== synced) {
    setSynced(current.join("-"));
    setValue(current);
  }

  return (
    <FieldSet>
      <FieldLegend variant="label">Price</FieldLegend>
      <Slider
        min={priceRange.min}
        max={priceRange.max}
        step={500}
        value={value}
        minStepsBetweenValues={1}
        onValueChange={(next) => setValue(next as [number, number])}
        onValueCommitted={(next) => {
          const [min, max] = next as [number, number];
          setQuery({
            minPrice: min <= priceRange.min ? null : min,
            maxPrice: max >= priceRange.max ? null : max,
          });
        }}
        aria-label="Price range"
      />
      <div className="flex justify-between text-sm text-muted-foreground tabular-nums">
        <span>{formatPrice(value[0])}</span>
        <span>
          {formatPrice(value[1])}
          {value[1] >= priceRange.max && "+"}
        </span>
      </div>
    </FieldSet>
  );
}

function ProductFilters({
  options,
  className,
}: {
  options: FilterOptions;
  className?: string;
}) {
  const { query, setQuery } = useProductQuery();
  const activeCount = countActiveFilters(query);
  // Rendered twice (sidebar + mobile sheet), so ids must be unique per copy.
  const uid = useId();

  return (
    <FieldGroup className={cn("gap-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Filters</h2>
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0"
          disabled={activeCount === 0}
          onClick={() =>
            setQuery({
              categories: [],
              brands: [],
              minPrice: null,
              maxPrice: null,
              minRating: null,
              inStock: false,
              onSale: false,
            })
          }
        >
          Clear all
        </Button>
      </div>

      <FieldSet>
        <FieldLegend variant="label">Category</FieldLegend>
        <FieldGroup data-slot="checkbox-group" className="gap-3">
          {options.categories.map((category) => {
            const id = `${uid}-category-${category.id}`;
            return (
              <Field key={category.id} orientation="horizontal">
                <Checkbox
                  id={id}
                  aria-label={category.name}
                  checked={query.categories.includes(category.id)}
                  onCheckedChange={(checked) =>
                    setQuery({
                      categories: toggle(
                        query.categories,
                        category.id,
                        checked,
                      ),
                    })
                  }
                />
                <FieldLabel htmlFor={id} className="font-normal">
                  {category.name}
                </FieldLabel>
                <Count value={options.categoryCounts[category.id]} />
              </Field>
            );
          })}
        </FieldGroup>
      </FieldSet>

      <Separator />

      <PriceFilter priceRange={options.priceRange} />

      <Separator />

      <FieldSet>
        <FieldLegend variant="label">Rating</FieldLegend>
        <RadioGroup
          value={query.minRating === null ? "any" : String(query.minRating)}
          onValueChange={(value) =>
            setQuery({ minRating: value === "any" ? null : Number(value) })
          }
        >
          {ratingOptions.map((option) => {
            const id = `${uid}-rating-${option.value}`;
            return (
              <Field key={option.value} orientation="horizontal">
                <RadioGroupItem
                  id={id}
                  value={option.value}
                  aria-label={option.label}
                />
                <FieldLabel htmlFor={id} className="font-normal">
                  {option.label}
                </FieldLabel>
              </Field>
            );
          })}
        </RadioGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend variant="label">Availability</FieldLegend>
        <FieldGroup data-slot="checkbox-group" className="gap-3">
          <Field orientation="horizontal">
            <Checkbox
              id={`${uid}-in-stock`}
              aria-label="In stock only"
              checked={query.inStock}
              onCheckedChange={(checked) => setQuery({ inStock: checked })}
            />
            <FieldLabel htmlFor={`${uid}-in-stock`} className="font-normal">
              In stock only
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox
              id={`${uid}-on-sale`}
              aria-label="On sale"
              checked={query.onSale}
              onCheckedChange={(checked) => setQuery({ onSale: checked })}
            />
            <FieldLabel htmlFor={`${uid}-on-sale`} className="font-normal">
              On sale
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Separator />

      <FieldSet>
        <FieldLegend variant="label">Brand</FieldLegend>
        <FieldGroup data-slot="checkbox-group" className="gap-3">
          {options.brands.map((brand) => {
            const id = `${uid}-brand-${brand.replace(/\W+/g, "-").toLowerCase()}`;
            return (
              <Field key={brand} orientation="horizontal">
                <Checkbox
                  id={id}
                  aria-label={brand}
                  checked={query.brands.includes(brand)}
                  onCheckedChange={(checked) =>
                    setQuery({ brands: toggle(query.brands, brand, checked) })
                  }
                />
                <FieldLabel htmlFor={id} className="font-normal">
                  {brand}
                </FieldLabel>
                <Count value={options.brandCounts[brand]} />
              </Field>
            );
          })}
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}

export { ProductFilters, type FilterOptions };
