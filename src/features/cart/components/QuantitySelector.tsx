"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type QuantitySelectorProps = {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
  label?: string;
  size?: "default" | "sm";
  className?: string;
};

function QuantitySelector({
  id,
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  label = "Quantity",
  size = "default",
  className,
}: QuantitySelectorProps) {
  const clamp = (next: number) =>
    Math.min(Math.max(Number.isFinite(next) ? next : min, min), max);

  return (
    <InputGroup
      className={cn(size === "sm" ? "h-8 w-28" : "w-32", className)}
      data-disabled={disabled}
    >
      <InputGroupAddon>
        <InputGroupButton
          size="icon-xs"
          aria-label="Decrease quantity"
          disabled={disabled || value <= min}
          onClick={() => onChange(clamp(value - 1))}
        >
          <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupInput
        id={id}
        type="number"
        inputMode="numeric"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clamp(event.target.valueAsNumber))}
        className="[appearance:textfield] text-center tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label="Increase quantity"
          disabled={disabled || value >= max}
          onClick={() => onChange(clamp(value + 1))}
        >
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { QuantitySelector };
