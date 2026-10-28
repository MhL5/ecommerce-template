"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];

/** Five stars; picking one fills it and every star before it. */
function StarRatingInput({
  id,
  value,
  invalid,
  onChange,
}: {
  id?: string;
  value: number;
  invalid?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <ToggleGroup
        id={id}
        spacing={0}
        value={value ? [String(value)] : []}
        onValueChange={(next) => {
          const picked = Number(next[0]);
          if (picked) onChange(picked);
        }}
        aria-label="Rating"
        aria-invalid={invalid}
      >
        {labels.map((label, index) => {
          const stars = index + 1;
          return (
            <ToggleGroupItem
              key={label}
              value={String(stars)}
              aria-label={`${stars} of 5 stars, ${label.toLowerCase()}`}
              className="data-pressed:bg-transparent"
            >
              <HugeiconsIcon
                icon={StarIcon}
                strokeWidth={1.5}
                className={cn(
                  "size-5",
                  stars <= value
                    ? "fill-current text-primary"
                    : "text-muted-foreground",
                )}
              />
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      <span className="text-sm text-muted-foreground" aria-hidden>
        {value ? labels[value - 1] : "Tap a star"}
      </span>
    </div>
  );
}

export { StarRatingInput };
