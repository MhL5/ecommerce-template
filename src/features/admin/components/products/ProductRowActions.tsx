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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/components/ui/link";
import { toast } from "@/components/ui/toast";
import {
  deleteProduct,
  updateProduct,
} from "@/features/products/api/catalog-store";
import type { Product } from "@/features/products/types";
import {
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
  StarIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

function ProductRowActions({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: (product: Product) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${product.name}`}
            />
          }
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href={`/products/${product.slug}`} />}
            >
              <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
              View in shop
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updateProduct(product.id, { featured: !product.featured });
                toast.add({
                  title: product.featured ? "Unfeatured" : "Featured",
                  description: product.name,
                });
              }}
            >
              <HugeiconsIcon icon={StarIcon} strokeWidth={2} />
              {product.featured ? "Remove from featured" : "Mark as featured"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It disappears from the shop, carts and wishlists. Past orders keep
              their copy. You can bring every deleted product back with “Reset
              catalog”.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteProduct(product.id);
                setConfirmDelete(false);
                toast.add({
                  title: "Product deleted",
                  description: product.name,
                });
              }}
            >
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { ProductRowActions };
