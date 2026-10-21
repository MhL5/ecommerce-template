"use client";

import { Button } from "@/components/ui/button";

export default function Page() {
  async function handleClick() {}

  return (
    <section className="grid min-h-dvh w-full place-items-center">
      <div>
        <Button onClick={handleClick}>{"Click me"}</Button>
      </div>
    </section>
  );
}
