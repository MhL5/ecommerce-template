import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";

type SectionHeadingProps = {
  title: string;
  description?: string;
  href?: Route;
  linkLabel?: string;
};

function SectionHeading({
  title,
  description,
  href,
  linkLabel = "View all",
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {href && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          nativeButton={false}
          render={<Link href={href} />}
        >
          {linkLabel}
          <HugeiconsIcon
            icon={ArrowRight02Icon}
            strokeWidth={2}
            data-icon="inline-end"
            className="rtl:rotate-180"
          />
        </Button>
      )}
    </div>
  );
}

export { SectionHeading };
