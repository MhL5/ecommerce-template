import { Skeleton } from "@/components/ui/skeleton";

function CartViewSkeleton() {
  return (
    <div
      className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]"
      aria-busy="true"
    >
      <div className="flex flex-col gap-5 rounded-xl p-6 ring-1 ring-foreground/10">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="size-24 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="mt-auto h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

export { CartViewSkeleton };
