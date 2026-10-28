import { countryName } from "@/features/checkout/utils/countries";
import type { OrderAddress } from "@/features/orders/types";

/** A postal address as lines of text. */
function AddressLines({
  address,
  showPhone = false,
}: {
  address: OrderAddress;
  showPhone?: boolean;
}) {
  return (
    <>
      <span className="block">
        {address.firstName} {address.lastName}
      </span>
      <span className="block">{address.address1}</span>
      {address.address2 && <span className="block">{address.address2}</span>}
      <span className="block">
        {address.city}, {address.region} {address.postalCode}
      </span>
      <span className="block">{countryName(address.country)}</span>
      {showPhone && address.phone && (
        <span className="block text-muted-foreground">{address.phone}</span>
      )}
    </>
  );
}

/** One-line summary, e.g. "12 Main St, Portland, OR 97201". */
function formatAddressLine(address: OrderAddress) {
  return `${address.address1}, ${address.city}, ${address.region} ${address.postalCode}`;
}

export { AddressLines, formatAddressLine };
