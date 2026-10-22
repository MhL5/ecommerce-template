import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { mainNav } from "@/features/layout/config";
import { cn } from "@/lib/utils";

function MainNav({ className }: { className?: string }) {
  return (
    <nav aria-label="Main" className={cn("flex items-center", className)}>
      {mainNav.map((link) => (
        <Button
          key={link.label}
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={link.href} />}
        >
          {link.label}
        </Button>
      ))}
    </nav>
  );
}

export { MainNav };
