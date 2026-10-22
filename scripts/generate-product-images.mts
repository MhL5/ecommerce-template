/**
 * Generates placeholder product and category art as SVG files in `public/`.
 *
 *   node scripts/generate-product-images.mts
 *
 * Each product gets three shots (`<slug>-1..3.svg`): its icon on a light
 * gradient, a zoomed and tilted close-up, and a dark "studio" variant.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

import { categories } from "../src/features/products/api/data/categories.ts";
import { products } from "../src/features/products/api/data/products.ts";

type IconNode = [string, Record<string, string>][];

const require = createRequire(import.meta.url);
const icons = require("@hugeicons/core-free-icons") as Record<string, IconNode>;

const categoryHue: Record<string, number> = {
  electronics: 222,
  clothing: 18,
  "home-kitchen": 150,
  "sports-outdoors": 190,
  beauty: 335,
  accessories: 40,
};

const categoryIcon: Record<string, string> = {
  electronics: "LaptopIcon",
  clothing: "TShirtIcon",
  "home-kitchen": "Sofa01Icon",
  "sports-outdoors": "Dumbbell01Icon",
  beauty: "PerfumeIcon",
  accessories: "HandBag01Icon",
};

const productIcon: Record<string, string> = {
  "aurora-wireless-headphones": "HeadphonesIcon",
  "pulse-smartwatch": "SmartWatch01Icon",
  "echo-bluetooth-speaker": "SpeakerIcon",
  "nova-mechanical-keyboard": "KeyboardIcon",
  "orbit-wireless-mouse": "Mouse01Icon",
  "lumen-4k-webcam": "WebcamIcon",
  "classic-cotton-tee": "TShirtIcon",
  "everyday-overshirt": "LongSleeveShirtIcon",
  "merino-crew-sweater": "ClothesIcon",
  "relaxed-jogger-pants": "JoggerPantsIcon",
  "canvas-low-top-sneakers": "SneakerIcon",
  "ribbed-wool-beanie": "HatIcon",
  "pour-over-coffee-set": "Coffee02Icon",
  "stoneware-dinnerware-set": "Dish01Icon",
  "linen-duvet-cover": "BedDoubleIcon",
  "cast-iron-skillet": "Pan01Icon",
  "electric-gooseneck-kettle": "KettleIcon",
  "arc-desk-lamp": "LampDeskIcon",
  "trail-running-shoes": "RunningShoesIcon",
  "pro-yoga-mat": "YogaMatIcon",
  "insulated-steel-bottle": "MilkBottleIcon",
  "summit-hiking-backpack": "Backpack01Icon",
  "adjustable-dumbbell-pair": "Dumbbell01Icon",
  "two-person-camping-tent": "TentIcon",
  "hydrating-face-serum": "DropletIcon",
  "daily-mineral-sunscreen": "Sun03Icon",
  "botanical-repair-shampoo": "ShampooIcon",
  "soft-bristle-makeup-brushes": "BlushBrush01Icon",
  "botanical-facial-oil": "Leaf01Icon",
  "cedar-eau-de-parfum": "PerfumeIcon",
  "leather-bifold-wallet": "Wallet01Icon",
  "polarized-sunglasses": "SunglassesIcon",
  "minimalist-field-watch": "Watch01Icon",
  "waxed-canvas-tote": "ShoppingBag01Icon",
  "everyday-leather-belt": "BeltIcon",
  "sterling-pendant-necklace": "NecklaceIcon",
};

function iconMarkup(name: string, stroke: string) {
  const node = icons[name];
  if (!node) throw new Error(`Unknown icon: ${name}`);

  return node
    .map(([tag, attrs]) => {
      const rendered = Object.entries(attrs)
        .filter(([key]) => key !== "key")
        .map(([key, value]) => {
          const attr = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
          const resolved = value === "currentColor" ? stroke : value;
          return `${attr}="${resolved}"`;
        })
        .join(" ");
      return `<${tag} ${rendered}/>`;
    })
    .join("");
}

type Variant = {
  bgFrom: string;
  bgTo: string;
  stroke: string;
  glow: string;
  scale: number;
  rotate: number;
  angle: number;
};

function variantsFor(hue: number): Variant[] {
  return [
    {
      bgFrom: `hsl(${hue} 70% 96%)`,
      bgTo: `hsl(${hue + 18} 55% 84%)`,
      stroke: `hsl(${hue} 45% 28%)`,
      glow: `hsl(${hue} 80% 99%)`,
      scale: 15,
      rotate: 0,
      angle: 135,
    },
    {
      bgFrom: `hsl(${hue - 12} 60% 90%)`,
      bgTo: `hsl(${hue + 10} 50% 76%)`,
      stroke: `hsl(${hue} 50% 24%)`,
      glow: `hsl(${hue} 70% 96%)`,
      scale: 22,
      rotate: -12,
      angle: 45,
    },
    {
      bgFrom: `hsl(${hue} 30% 22%)`,
      bgTo: `hsl(${hue + 20} 35% 12%)`,
      stroke: `hsl(${hue} 70% 88%)`,
      glow: `hsl(${hue} 50% 34%)`,
      scale: 14,
      rotate: 8,
      angle: 160,
    },
  ];
}

function svg(iconName: string, variant: Variant, id: string) {
  const size = 800;
  const iconPx = 24 * variant.scale;
  const offset = (size - iconPx) / 2;
  const rad = (variant.angle * Math.PI) / 180;
  const x2 = (0.5 + Math.cos(rad) / 2).toFixed(3);
  const y2 = (0.5 + Math.sin(rad) / 2).toFixed(3);
  const x1 = (1 - Number(x2)).toFixed(3);
  const y1 = (1 - Number(y2)).toFixed(3);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
<defs>
<linearGradient id="bg-${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
<stop offset="0" stop-color="${variant.bgFrom}"/>
<stop offset="1" stop-color="${variant.bgTo}"/>
</linearGradient>
<radialGradient id="glow-${id}" cx="0.5" cy="0.48" r="0.42">
<stop offset="0" stop-color="${variant.glow}" stop-opacity="0.9"/>
<stop offset="1" stop-color="${variant.glow}" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="${size}" height="${size}" fill="url(#bg-${id})"/>
<circle cx="400" cy="384" r="330" fill="url(#glow-${id})"/>
<ellipse cx="400" cy="${offset + iconPx + 36}" rx="${iconPx * 0.36}" ry="18" fill="${variant.stroke}" opacity="0.08"/>
<g fill="none" transform="rotate(${variant.rotate} 400 400) translate(${offset} ${offset - 16}) scale(${variant.scale})">${iconMarkup(iconName, variant.stroke)}</g>
</svg>
`;
}

const root = join(import.meta.dirname, "..", "public");
mkdirSync(join(root, "products"), { recursive: true });
mkdirSync(join(root, "categories"), { recursive: true });

let count = 0;

for (const product of products) {
  const icon = productIcon[product.slug] ?? categoryIcon[product.categoryId];
  const baseHue = categoryHue[product.categoryId] ?? 220;
  const hue = baseHue + ((Number(product.id.slice(1)) * 7) % 24) - 12;

  variantsFor(hue).forEach((variant, index) => {
    const file = join(root, "products", `${product.slug}-${index + 1}.svg`);
    writeFileSync(file, svg(icon!, variant, `${product.id}-${index}`));
    count++;
  });
}

for (const category of categories) {
  const hue = categoryHue[category.id] ?? 220;
  const [variant] = variantsFor(hue);
  const file = join(root, "categories", `${category.id}.svg`);
  writeFileSync(file, svg(categoryIcon[category.id]!, variant!, category.id));
  count++;
}

// eslint-disable-next-line no-console -- CLI output
console.log(`Wrote ${count} SVG files to public/`);
