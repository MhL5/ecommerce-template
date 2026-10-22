import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RscBoundaryProvider } from "@rsc-boundary/next";
import type { ReactNode } from "react";

import { DirectionProvider } from "./DirectionProvider";
import { ThemeProvider } from "./ThemeProvider";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <RscBoundaryProvider>
      <DirectionProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster limit={3}>{children}</Toaster>
          </TooltipProvider>
        </ThemeProvider>
      </DirectionProvider>
    </RscBoundaryProvider>
  );
}
