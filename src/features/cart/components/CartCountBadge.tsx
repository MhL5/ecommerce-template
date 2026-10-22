import { Badge } from "@/components/ui/badge";

/** Small count bubble pinned to the corner of an icon button. */
function CartCountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <Badge className="pointer-events-none absolute -end-1 -top-1 h-4.5 min-w-4.5 px-1 tabular-nums">
      {count > 99 ? "99+" : count}
    </Badge>
  );
}

export { CartCountBadge };
