"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useProductQuery } from "@/features/products/hooks/use-product-query";
import { cn } from "@/lib/utils";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";

const DEBOUNCE_MS = 350;

/** Typing updates `?q=` after a short pause; Enter applies it immediately. */
function ProductSearch({ className }: { className?: string }) {
  const { query, setQuery, isPending } = useProductQuery();
  const [value, setValue] = useState(query.q);
  const [syncedQ, setSyncedQ] = useState(query.q);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Adopt outside changes to `q` (header search, "clear filters", back button).
  if (query.q !== syncedQ) {
    setSyncedQ(query.q);
    setValue(query.q);
  }

  function apply(next: string) {
    clearTimeout(timer.current);
    if (next.trim() !== query.q) setQuery({ q: next.trim() });
  }

  function onChange(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => apply(next), DEBOUNCE_MS);
  }

  return (
    <form
      role="search"
      className={cn("w-full", className)}
      onSubmit={(event) => {
        event.preventDefault();
        apply(value);
      }}
    >
      <InputGroup>
        <InputGroupInput
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by name, brand or tag…"
          aria-label="Search products"
          autoComplete="off"
        />
        <InputGroupAddon>
          {isPending ? (
            <Spinner />
          ) : (
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
          )}
        </InputGroupAddon>
        {value && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Clear search"
              onClick={() => {
                setValue("");
                apply("");
              }}
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    </form>
  );
}

export { ProductSearch };
