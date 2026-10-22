"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  resetCatalog,
  useCatalogIsModified,
} from "@/features/products/api/catalog-store";
import { useState } from "react";

/** Throws away every admin catalogue change (only shown when there are some). */
function ResetCatalogButton() {
  const modified = useCatalogIsModified();
  const [open, setOpen] = useState(false);

  if (!modified) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Reset catalog
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset the catalog?</AlertDialogTitle>
          <AlertDialogDescription>
            Removes products you added, restores deleted ones and undoes every
            edit — including stock changes from orders. Orders themselves are
            kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              resetCatalog();
              setOpen(false);
              toast.add({ title: "Catalog reset to the original data" });
            }}
          >
            Reset catalog
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ResetCatalogButton };
