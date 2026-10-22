import { Link } from "@/components/ui/link";
import { SITE_NAME } from "@/features/layout/config";
import { cn } from "@/lib/utils";
import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground [&_svg]:size-4">
        <HugeiconsIcon
          icon={StarIcon}
          strokeWidth={2}
          className="fill-current"
        />
      </span>
      <span className="text-lg">{SITE_NAME}</span>
    </Link>
  );
}

export { Logo };
