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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { AccountOrdersSkeleton } from "@/features/account/components/AccountSkeleton";
import {
  deleteAddress,
  setDefaultAddress,
} from "@/features/addresses/api/address-store";
import { AddressFormDialog } from "@/features/addresses/components/AddressFormDialog";
import { AddressLines } from "@/features/addresses/components/AddressLines";
import { useAddresses } from "@/features/addresses/hooks/use-addresses";
import type { SavedAddress } from "@/features/addresses/types";
import { useSession } from "@/features/auth/hooks/use-session";
import type { PublicUser } from "@/features/auth/types";
import { pluralize } from "@/lib/format";
import { Add01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

function AddressCard({
  address,
  onEdit,
  onDelete,
}: {
  address: SavedAddress;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="truncate">
          {address.label || `${address.firstName} ${address.lastName}`}
        </CardTitle>
        {address.isDefault && (
          <CardAction>
            <Badge>Default</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="text-sm leading-relaxed">
        <AddressLines address={address} showPhone />
      </CardContent>
      <CardFooter className="mt-auto flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Edit
        </Button>
        {!address.isDefault && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDefaultAddress(address.userId, address.id);
              toast.add({ title: "Default address updated" });
            }}
          >
            Set as default
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="ms-auto text-destructive"
          onClick={onDelete}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

function AddressBook({ user }: { user: PublicUser }) {
  const { addresses } = useAddresses(user.id);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | undefined>();
  const [deleting, setDeleting] = useState<SavedAddress | null>(null);
  // Bumped on every open so the uncontrolled fields start fresh each time.
  const [formKey, setFormKey] = useState(0);

  function openForm(address?: SavedAddress) {
    setEditing(address);
    setFormKey((key) => key + 1);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {pluralize(addresses.length, "saved address", "saved addresses")}
        </p>
        {addresses.length > 0 && (
          <Button size="sm" onClick={() => openForm()}>
            <HugeiconsIcon
              icon={Add01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Add address
          </Button>
        )}
      </div>

      {addresses.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Location01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>No saved addresses</EmptyTitle>
            <EmptyDescription>
              Save an address to check out faster next time.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => openForm()}>Add address</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => openForm(address)}
              onDelete={() => setDeleting(address)}
            />
          ))}
        </div>
      )}

      <AddressFormDialog
        key={formKey}
        userId={user.id}
        address={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this address?</AlertDialogTitle>
            <AlertDialogDescription>
              Past orders keep their own copy of the address, so they won’t
              change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleting) deleteAddress(deleting.id);
                setDeleting(null);
                toast.add({ title: "Address deleted" });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AccountAddresses() {
  const { user } = useSession();
  if (!user) return <AccountOrdersSkeleton />;
  return <AddressBook user={user} />;
}

export { AccountAddresses };
