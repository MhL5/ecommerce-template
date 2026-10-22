"use client";

import { Button } from "@/components/ui/button";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "@teispace/next-themes";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme (D)"
      title="Toggle theme (D)"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Both icons render; CSS picks one so SSR markup never mismatches. */}
      <HugeiconsIcon icon={Sun03Icon} strokeWidth={2} className="dark:hidden" />
      <HugeiconsIcon
        icon={Moon02Icon}
        strokeWidth={2}
        className="hidden dark:block"
      />
    </Button>
  );
}

export { ThemeToggle };
