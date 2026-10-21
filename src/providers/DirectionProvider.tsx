import { DirectionProvider as ShadcnDirectionProvider } from "@/components/ui/direction";
import type { PropsWithChildren } from "react";

function DirectionProvider({ children }: PropsWithChildren) {
  return (
    <ShadcnDirectionProvider direction="ltr">
      {children}
    </ShadcnDirectionProvider>
  );
}

export { DirectionProvider };
