import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Form from "next/form";

/** GET form to `/products?q=`; next/form makes it a client-side navigation. */
function HeaderSearch({ className }: { className?: string }) {
  return (
    <Form action="/products" role="search" className={cn("w-full", className)}>
      <InputGroup>
        <InputGroupInput
          type="search"
          name="q"
          placeholder="Search products…"
          aria-label="Search products"
          autoComplete="off"
        />
        <InputGroupAddon>
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
        </InputGroupAddon>
      </InputGroup>
    </Form>
  );
}

export { HeaderSearch };
