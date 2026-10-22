import type { ProductQueryResult } from "@/features/products/types";

function ResultsSummary({ result }: { result: ProductQueryResult }) {
  if (result.total === 0) return null;

  const start = (result.page - 1) * result.pageSize + 1;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      Showing{" "}
      <span className="font-medium text-foreground tabular-nums">
        {start}–{end}
      </span>{" "}
      of{" "}
      <span className="font-medium text-foreground tabular-nums">
        {result.total}
      </span>{" "}
      {result.total === 1 ? "product" : "products"}
    </p>
  );
}

export { ResultsSummary };
