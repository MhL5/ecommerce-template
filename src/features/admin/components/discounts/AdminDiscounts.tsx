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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { AdminSkeleton } from "@/features/admin/components/AdminSkeleton";
import { DiscountFormSheet } from "@/features/admin/components/discounts/DiscountFormSheet";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  deleteDiscountCode,
  resetDiscountCodes,
  setDiscountActive,
  useDiscountCodes,
  useDiscountCodesModified,
} from "@/features/checkout/api/discount-store";
import type { DiscountCode, DiscountStatus } from "@/features/checkout/types";
import {
  countDiscountUses,
  describeDiscountValue,
  getDiscountStatus,
} from "@/features/checkout/utils/discounts";
import { useAllOrders } from "@/features/orders/hooks/use-orders";
import { formatDate, formatPrice, pluralize } from "@/lib/format";
import {
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

const statusBadges: Record<
  DiscountStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  active: { label: "Active", variant: "default" },
  scheduled: { label: "Scheduled", variant: "outline" },
  expired: { label: "Expired", variant: "secondary" },
  "used-up": { label: "Used up", variant: "secondary" },
  disabled: { label: "Off", variant: "outline" },
};

function validity(code: DiscountCode) {
  if (code.startsAt && code.endsAt)
    return `${formatDate(code.startsAt)} – ${formatDate(code.endsAt)}`;
  if (code.startsAt) return `From ${formatDate(code.startsAt)}`;
  if (code.endsAt) return `Until ${formatDate(code.endsAt)}`;
  return "No end date";
}

function DiscountRowActions({
  discount,
  onEdit,
}: {
  discount: DiscountCode;
  onEdit: () => void;
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
              aria-label={`Actions for ${discount.code}`}
            />
          }
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onEdit}>
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
              Edit
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
            <AlertDialogTitle>Delete {discount.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Shoppers can’t use it any more. Orders that already used it keep
              their discount. To pause it instead, switch it off.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                deleteDiscountCode(discount.id);
                setConfirmDelete(false);
                toast.add({
                  title: "Discount deleted",
                  description: discount.code,
                });
              }}
            >
              Delete code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ResetDiscountsButton() {
  const modified = useDiscountCodesModified();
  const [open, setOpen] = useState(false);

  if (!modified) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        Reset codes
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset discount codes?</AlertDialogTitle>
          <AlertDialogDescription>
            Removes codes you added and undoes every edit, bringing back the
            original WELCOME10, FREESHIP and SAVE20.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              resetDiscountCodes();
              setOpen(false);
              toast.add({ title: "Discount codes reset" });
            }}
          >
            Reset codes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Rendered only after the admin check, so reading the clock is safe. */
function DiscountsPanel() {
  const codes = useDiscountCodes();
  const { orders } = useAllOrders();
  const [now] = useState(() => Date.now());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  // Bumped on every open so the form starts fresh each time.
  const [formKey, setFormKey] = useState(0);

  const uses = countDiscountUses(orders);
  const activeCount = codes.filter(
    (code) =>
      getDiscountStatus(code, uses.get(code.code) ?? 0, now) === "active",
  ).length;

  function openForm(code: DiscountCode | null) {
    setEditing(code);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }

  return (
    <>
      <AdminPageHeader
        title="Discounts"
        description="Promo codes shoppers can enter at checkout."
        actions={
          <>
            <ResetDiscountsButton />
            <Button onClick={() => openForm(null)}>
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Add discount
            </Button>
          </>
        }
      />

      <Card className="gap-0 pb-0">
        <CardHeader className="border-b pb-4">
          <CardTitle>
            {pluralize(codes.length, "code")}
            <span className="font-normal text-muted-foreground">
              {" "}
              · {activeCount} active
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {codes.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyTitle>No discount codes</EmptyTitle>
                <EmptyDescription>
                  Create one to run a promotion.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => openForm(null)}>Add discount</Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-6">Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Valid</TableHead>
                  <TableHead className="text-end">Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Active</span>
                  </TableHead>
                  <TableHead className="pe-6">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => {
                  const used = uses.get(code.code) ?? 0;
                  const status =
                    statusBadges[getDiscountStatus(code, used, now)];
                  return (
                    <TableRow key={code.id}>
                      <TableCell className="ps-6">
                        <span className="flex flex-col">
                          <span className="font-mono font-medium">
                            {code.code}
                          </span>
                          <span className="max-w-64 truncate text-xs text-muted-foreground">
                            {code.description}
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-col">
                          <span>{describeDiscountValue(code)}</span>
                          {code.minSubtotal && (
                            <span className="text-xs text-muted-foreground">
                              Orders over {formatPrice(code.minSubtotal)}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {validity(code)}
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        {used}
                        {code.usageLimit !== null && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {code.usageLimit}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          size="sm"
                          checked={code.isActive}
                          aria-label={`${code.code} active`}
                          onCheckedChange={(checked) => {
                            setDiscountActive(code.id, checked);
                            toast.add({
                              title: checked
                                ? "Code switched on"
                                : "Code switched off",
                              description: code.code,
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell className="pe-6 text-end">
                        <DiscountRowActions
                          discount={code}
                          onEdit={() => openForm(code)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DiscountFormSheet
        key={formKey}
        discount={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </>
  );
}

function AdminDiscounts() {
  const { isAdmin } = useSession();
  if (!isAdmin) return <AdminSkeleton />;
  return <DiscountsPanel />;
}

export { AdminDiscounts };
