"use client";

import { Img } from "@/components/ui/Img";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ProductGalleryProps = {
  images: string[];
  name: string;
  soldOut?: boolean;
};

function ProductGallery({
  images,
  name,
  soldOut = false,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0] ?? "";

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:items-start">
      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/10">
        <Img
          key={current}
          src={current}
          alt={`${name} — image ${active + 1} of ${images.length}`}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className={cn(
            "animate-in object-cover duration-300 fade-in-0",
            soldOut && "opacity-60 grayscale",
          )}
        />
      </div>

      <div
        role="group"
        aria-label="Product images"
        className="flex gap-3 md:flex-col"
      >
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={`Show image ${index + 1}`}
            aria-pressed={index === active}
            onClick={() => setActive(index)}
            className={cn(
              "relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10 transition-shadow outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-24",
              index === active && "ring-2 ring-primary",
            )}
          >
            <Img
              src={image}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { ProductGallery };
