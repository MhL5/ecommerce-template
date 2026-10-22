import { Skeleton } from "@/components/ui/skeleton";

function AccountOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function AccountOrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export { AccountOrdersSkeleton, AccountOverviewSkeleton };
