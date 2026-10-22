import type { Category } from "@/features/products/types";

const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Headphones, wearables and desk gear that just work.",
    image: "/categories/electronics.svg",
  },
  {
    id: "clothing",
    name: "Clothing",
    description: "Everyday essentials in natural, long-lasting fabrics.",
    image: "/categories/clothing.svg",
  },
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    description: "Cookware, lighting and comforts for the place you live.",
    image: "/categories/home-kitchen.svg",
  },
  {
    id: "sports-outdoors",
    name: "Sports & Outdoors",
    description: "Kit for training days, trail runs and weekends away.",
    image: "/categories/sports-outdoors.svg",
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Clean skincare, haircare and fragrance.",
    image: "/categories/beauty.svg",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Wallets, bags, eyewear and finishing touches.",
    image: "/categories/accessories.svg",
  },
];

export { categories };
