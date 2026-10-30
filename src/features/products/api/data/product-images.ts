/**
 * Product photography, three shots per product.
 *
 * The images are hotlinked from Pexels (https://www.pexels.com/license/) — free
 * for commercial use, no attribution required. `next.config.ts` allows the
 * `images.pexels.com` host in `images.remotePatterns`.
 */
const productImages: Record<string, number[]> = {
  // Electronics
  "aurora-wireless-headphones": [3394666, 36230830, 3394650],
  "pulse-smartwatch": [5081914, 14979021, 11592447],
  "echo-bluetooth-speaker": [1034653, 11764413, 7772558],
  "nova-mechanical-keyboard": [9020272, 18641167, 7662061],
  "orbit-wireless-mouse": [7240349, 9161032, 7151696],
  "lumen-4k-webcam": [320617, 26873540, 36715283],
  // Clothing
  "classic-cotton-tee": [12025472, 12039633, 11671964],
  "everyday-overshirt": [7175999, 17580087, 6843235],
  "merino-crew-sweater": [14642651, 6630834, 5603269],
  "relaxed-jogger-pants": [39457564, 39457743, 39457507],
  "canvas-low-top-sneakers": [4271694, 30128844, 4271586],
  "ribbed-wool-beanie": [37484033, 11630886, 11630885],
  // Home & kitchen
  "pour-over-coffee-set": [7658169, 7658102, 27902269],
  "stoneware-dinnerware-set": [7674572, 6794584, 11371877],
  "linen-duvet-cover": [7445081, 3847588, 27439405],
  "cast-iron-skillet": [4409307, 10596354, 30537297],
  "electric-gooseneck-kettle": [17837368, 19097139, 14679166],
  "arc-desk-lamp": [8004021, 19354255, 7439766],
  // Sports & outdoors
  "trail-running-shoes": [260044, 32798746, 1027130],
  "pro-yoga-mat": [4325439, 7318664, 6339731],
  "insulated-steel-bottle": [7815021, 7815024, 14698374],
  "summit-hiking-backpack": [7009861, 9303525, 9629915],
  "adjustable-dumbbell-pair": [4047134, 16567043, 4716814],
  "two-person-camping-tent": [11113247, 17192955, 2526025],
  // Beauty
  "hydrating-face-serum": [35899861, 14215459, 34476746],
  "daily-mineral-sunscreen": [8384597, 34823989, 8384509],
  "botanical-repair-shampoo": [8167172, 16280928, 7440140],
  "soft-bristle-makeup-brushes": [205923, 7290181, 22481931],
  "botanical-facial-oil": [8490173, 8709600, 10695206],
  "cedar-eau-de-parfum": [7364096, 32645089, 14736080],
  // Accessories
  "leather-bifold-wallet": [28086454, 32954513, 28028234],
  "polarized-sunglasses": [27353350, 8360292, 27353347],
  "minimalist-field-watch": [20022436, 31050003, 128619],
  "waxed-canvas-tote": [9869067, 6786665, 30037027],
  "everyday-leather-belt": [31959216, 35222039, 31959215],
  "sterling-pendant-necklace": [16109188, 9430995, 9430989],
};

const pexelsImage = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

/** Used for products created in the admin, and any slug without a mapping. */
const fallbackProductImage = pexelsImage(32583519);

/** Image URLs for a product slug. */
function getProductImages(slug: string): string[] {
  const ids = productImages[slug];
  return ids ? ids.map(pexelsImage) : [fallbackProductImage];
}

export { fallbackProductImage, getProductImages };
