import { Skeleton } from "@/components/ui/skeleton";

function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col gap-3 md:flex-row-reverse">
          <Skeleton className="aspect-square flex-1 rounded-2xl" />
          <div className="flex gap-3 md:flex-col">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="size-20 rounded-xl sm:size-24" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { ProductDetailSkeleton };
