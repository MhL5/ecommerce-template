import { cn } from "@/lib/utils";
import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type ProductRatingProps = {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "default";
  className?: string;
};

function Stars({
  className,
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <span className={cn("flex", className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <HugeiconsIcon
          key={index}
          icon={StarIcon}
          strokeWidth={1.5}
          // The svg's own fill="none" beats an inherited fill, so set it here.
          className={cn("shrink-0", filled && "fill-current")}
        />
      ))}
    </span>
  );
}

/** Five stars with the filled layer clipped to the exact rating. */
function ProductRating({
  rating,
  reviewCount,
  size = "default",
  className,
}: ProductRatingProps) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));

  if (reviewCount === 0) {
    return (
      <p
        className={cn(
          "text-sm text-muted-foreground",
          size === "sm" && "text-xs",
          className,
        )}
      >
        No reviews yet
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm",
        size === "sm" && "text-xs",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex [&_svg]:size-4",
          size === "sm" && "[&_svg]:size-3.5",
        )}
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
      >
        <Stars className="text-muted-foreground/40" />
        <span
          className="absolute inset-y-0 start-0 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <Stars filled className="text-primary" />
        </span>
      </span>
      <span className="font-medium tabular-nums">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-muted-foreground tabular-nums">
          ({reviewCount.toLocaleString("en-US")})
        </span>
      )}
    </div>
  );
}

export { ProductRating };
