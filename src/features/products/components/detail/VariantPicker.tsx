"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProductOption, ProductVariant } from "@/features/products/types";
import { cn } from "@/lib/utils";
import { useId } from "react";

type VariantPickerProps = {
  options: ProductOption[];
  variants: ProductVariant[];
  selected: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
  disabled?: boolean;
};

/**
 * One toggle row per option (Color, Size, …). Picking a value selects the
 * variant that keeps the other current values; values whose combination is
 * sold out stay selectable but are struck through.
 */
function VariantPicker({
  options,
  variants,
  selected,
  onSelect,
  disabled,
}: VariantPickerProps) {
  const baseId = useId();

  function variantWith(optionIndex: number, value: string) {
    const values = selected.values.with(optionIndex, value);
    return variants.find((variant) =>
      variant.values.every((v, index) => v === values[index]),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {options.map((option, optionIndex) => {
        const labelId = `${baseId}-${optionIndex}`;
        const current = selected.values[optionIndex];
        return (
          <div key={option.name} className="flex flex-col gap-2">
            <p id={labelId} className="text-sm font-medium">
              {option.name}:{" "}
              <span className="font-normal text-muted-foreground">
                {current}
              </span>
            </p>
            <ToggleGroup
              variant="outline"
              aria-labelledby={labelId}
              className="flex-wrap"
              value={current ? [current] : []}
              onValueChange={(value) => {
                const next = value[0];
                if (!next) return;
                const variant = variantWith(optionIndex, next);
                if (variant) onSelect(variant);
              }}
              disabled={disabled}
            >
              {option.values.map(({ value, swatch }) => {
                const soldOut =
                  (variantWith(optionIndex, value)?.stock ?? 0) <= 0;
                return (
                  <ToggleGroupItem
                    key={value}
                    value={value}
                    aria-label={soldOut ? `${value} (sold out)` : value}
                    className={cn(
                      "min-w-12 aria-pressed:border-primary aria-pressed:bg-transparent aria-pressed:ring-1 aria-pressed:ring-primary",
                      soldOut && "text-muted-foreground line-through",
                    )}
                  >
                    {swatch && (
                      <span
                        aria-hidden
                        className="size-4 rounded-full ring-1 ring-foreground/15"
                        style={{ backgroundColor: swatch }}
                      />
                    )}
                    {value}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>
        );
      })}
    </div>
  );
}

export { VariantPicker };
