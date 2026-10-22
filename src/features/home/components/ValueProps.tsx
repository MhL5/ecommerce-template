import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { PageContainer } from "@/features/layout/components/PageContainer";
import {
  CustomerSupportIcon,
  DeliveryReturn01Icon,
  DeliveryTruck01Icon,
  SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const props = [
  {
    icon: DeliveryTruck01Icon,
    title: "Free shipping over $75",
    description: "Standard delivery in 3–5 business days.",
  },
  {
    icon: DeliveryReturn01Icon,
    title: "30-day returns",
    description: "Changed your mind? Send it back, no questions.",
  },
  {
    icon: SecurityCheckIcon,
    title: "Secure checkout",
    description: "This demo never takes real payment details.",
  },
  {
    icon: CustomerSupportIcon,
    title: "Real human support",
    description: "Weekdays 9–5, by email or chat.",
  },
];

function ValueProps() {
  return (
    <section aria-label="Why shop with us" className="border-y">
      <PageContainer className="grid gap-2 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {props.map((prop) => (
          <Item key={prop.title}>
            <ItemMedia variant="icon">
              <HugeiconsIcon icon={prop.icon} strokeWidth={2} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{prop.title}</ItemTitle>
              <ItemDescription>{prop.description}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </PageContainer>
    </section>
  );
}

export { ValueProps };
