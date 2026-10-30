import type { Category } from "@/features/products/types";

// Category tiles are hotlinked from Pexels (free to use, no attribution needed).
const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Headphones, wearables and desk gear that just work.",
    image:
      "https://images.pexels.com/photos/32583519/pexels-photo-32583519.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "clothing",
    name: "Clothing",
    description: "Everyday essentials in natural, long-lasting fabrics.",
    image:
      "https://images.pexels.com/photos/9603628/pexels-photo-9603628.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "home-kitchen",
    name: "Home & Kitchen",
    description: "Cookware, lighting and comforts for the place you live.",
    image:
      "https://images.pexels.com/photos/6195965/pexels-photo-6195965.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "sports-outdoors",
    name: "Sports & Outdoors",
    description: "Kit for training days, trail runs and weekends away.",
    image:
      "https://images.pexels.com/photos/27769600/pexels-photo-27769600.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Clean skincare, haircare and fragrance.",
    image:
      "https://images.pexels.com/photos/6167446/pexels-photo-6167446.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Wallets, bags, eyewear and finishing touches.",
    image:
      "https://images.pexels.com/photos/1132269/pexels-photo-1132269.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export { categories };
