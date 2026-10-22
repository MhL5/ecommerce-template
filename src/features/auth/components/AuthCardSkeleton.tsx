import { Skeleton } from "@/components/ui/skeleton";

function AuthCardSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-xl p-6 ring-1 ring-foreground/10"
      aria-busy="true"
    >
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export { AuthCardSkeleton };
