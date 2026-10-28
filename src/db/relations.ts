import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
    accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
    addresses: r.many.address({ from: r.user.id, to: r.address.userId }),
    cart: r.one.cart({ from: r.user.id, to: r.cart.userId }),
    wishlist: r.many.wishlistItem({
      from: r.user.id,
      to: r.wishlistItem.userId,
    }),
    orders: r.many.order({ from: r.user.id, to: r.order.userId }),
    reviews: r.many.review({ from: r.user.id, to: r.review.userId }),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
      optional: false,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
      optional: false,
    }),
  },

  category: {
    parent: r.one.category({
      from: r.category.parentId,
      to: r.category.id,
      alias: "category_parent",
    }),
    children: r.many.category({
      from: r.category.id,
      to: r.category.parentId,
      alias: "category_parent",
    }),
    products: r.many.product({ from: r.category.id, to: r.product.categoryId }),
    attributes: r.many.attribute({
      from: r.category.id.through(r.categoryAttribute.categoryId),
      to: r.attribute.id.through(r.categoryAttribute.attributeId),
    }),
  },
  brand: {
    products: r.many.product({ from: r.brand.id, to: r.product.brandId }),
  },
  product: {
    brand: r.one.brand({ from: r.product.brandId, to: r.brand.id }),
    category: r.one.category({
      from: r.product.categoryId,
      to: r.category.id,
    }),
    options: r.many.productOption({
      from: r.product.id,
      to: r.productOption.productId,
    }),
    variants: r.many.productVariant({
      from: r.product.id,
      to: r.productVariant.productId,
    }),
    images: r.many.productImage({
      from: r.product.id,
      to: r.productImage.productId,
    }),
    attributeValues: r.many.productAttributeValue({
      from: r.product.id,
      to: r.productAttributeValue.productId,
    }),
    reviews: r.many.review({ from: r.product.id, to: r.review.productId }),
  },
  productOption: {
    product: r.one.product({
      from: r.productOption.productId,
      to: r.product.id,
      optional: false,
    }),
    values: r.many.productOptionValue({
      from: r.productOption.id,
      to: r.productOptionValue.optionId,
    }),
  },
  productOptionValue: {
    option: r.one.productOption({
      from: r.productOptionValue.optionId,
      to: r.productOption.id,
      optional: false,
    }),
  },
  productVariant: {
    product: r.one.product({
      from: r.productVariant.productId,
      to: r.product.id,
      optional: false,
    }),
    optionValues: r.many.productVariantOptionValue({
      from: r.productVariant.id,
      to: r.productVariantOptionValue.variantId,
    }),
    images: r.many.productImage({
      from: r.productVariant.id,
      to: r.productImage.variantId,
    }),
    attributeValues: r.many.productAttributeValue({
      from: r.productVariant.id,
      to: r.productAttributeValue.variantId,
    }),
  },
  productVariantOptionValue: {
    variant: r.one.productVariant({
      from: r.productVariantOptionValue.variantId,
      to: r.productVariant.id,
      optional: false,
    }),
    option: r.one.productOption({
      from: r.productVariantOptionValue.optionId,
      to: r.productOption.id,
      optional: false,
    }),
    value: r.one.productOptionValue({
      from: r.productVariantOptionValue.optionValueId,
      to: r.productOptionValue.id,
      optional: false,
    }),
  },
  productImage: {
    product: r.one.product({
      from: r.productImage.productId,
      to: r.product.id,
      optional: false,
    }),
    variant: r.one.productVariant({
      from: r.productImage.variantId,
      to: r.productVariant.id,
    }),
  },

  attribute: {
    options: r.many.attributeOption({
      from: r.attribute.id,
      to: r.attributeOption.attributeId,
    }),
    categories: r.many.category({
      from: r.attribute.id.through(r.categoryAttribute.attributeId),
      to: r.category.id.through(r.categoryAttribute.categoryId),
    }),
  },
  attributeOption: {
    attribute: r.one.attribute({
      from: r.attributeOption.attributeId,
      to: r.attribute.id,
      optional: false,
    }),
  },
  categoryAttribute: {
    category: r.one.category({
      from: r.categoryAttribute.categoryId,
      to: r.category.id,
      optional: false,
    }),
    attribute: r.one.attribute({
      from: r.categoryAttribute.attributeId,
      to: r.attribute.id,
      optional: false,
    }),
  },
  productAttributeValue: {
    product: r.one.product({
      from: r.productAttributeValue.productId,
      to: r.product.id,
      optional: false,
    }),
    variant: r.one.productVariant({
      from: r.productAttributeValue.variantId,
      to: r.productVariant.id,
    }),
    attribute: r.one.attribute({
      from: r.productAttributeValue.attributeId,
      to: r.attribute.id,
      optional: false,
    }),
    option: r.one.attributeOption({
      from: r.productAttributeValue.optionId,
      to: r.attributeOption.id,
    }),
  },

  review: {
    product: r.one.product({
      from: r.review.productId,
      to: r.product.id,
      optional: false,
    }),
    user: r.one.user({ from: r.review.userId, to: r.user.id }),
  },

  address: {
    user: r.one.user({
      from: r.address.userId,
      to: r.user.id,
      optional: false,
    }),
  },
  wishlistItem: {
    user: r.one.user({
      from: r.wishlistItem.userId,
      to: r.user.id,
      optional: false,
    }),
    product: r.one.product({
      from: r.wishlistItem.productId,
      to: r.product.id,
      optional: false,
    }),
  },
  cart: {
    user: r.one.user({ from: r.cart.userId, to: r.user.id }),
    discount: r.one.discount({ from: r.cart.discountId, to: r.discount.id }),
    items: r.many.cartItem({ from: r.cart.id, to: r.cartItem.cartId }),
  },
  cartItem: {
    cart: r.one.cart({
      from: r.cartItem.cartId,
      to: r.cart.id,
      optional: false,
    }),
    variant: r.one.productVariant({
      from: r.cartItem.variantId,
      to: r.productVariant.id,
      optional: false,
    }),
  },

  discount: {
    redemptions: r.many.discountRedemption({
      from: r.discount.id,
      to: r.discountRedemption.discountId,
    }),
  },

  order: {
    user: r.one.user({ from: r.order.userId, to: r.user.id }),
    items: r.many.orderItem({ from: r.order.id, to: r.orderItem.orderId }),
    statusEvents: r.many.orderStatusEvent({
      from: r.order.id,
      to: r.orderStatusEvent.orderId,
    }),
    payments: r.many.payment({ from: r.order.id, to: r.payment.orderId }),
    discount: r.one.discount({ from: r.order.discountId, to: r.discount.id }),
    shippingMethod: r.one.shippingMethod({
      from: r.order.shippingMethodId,
      to: r.shippingMethod.id,
    }),
  },
  orderItem: {
    order: r.one.order({
      from: r.orderItem.orderId,
      to: r.order.id,
      optional: false,
    }),
    product: r.one.product({ from: r.orderItem.productId, to: r.product.id }),
    variant: r.one.productVariant({
      from: r.orderItem.variantId,
      to: r.productVariant.id,
    }),
  },
  orderStatusEvent: {
    order: r.one.order({
      from: r.orderStatusEvent.orderId,
      to: r.order.id,
      optional: false,
    }),
    actor: r.one.user({ from: r.orderStatusEvent.actorId, to: r.user.id }),
  },
  payment: {
    order: r.one.order({
      from: r.payment.orderId,
      to: r.order.id,
      optional: false,
    }),
  },
  discountRedemption: {
    discount: r.one.discount({
      from: r.discountRedemption.discountId,
      to: r.discount.id,
      optional: false,
    }),
    order: r.one.order({
      from: r.discountRedemption.orderId,
      to: r.order.id,
      optional: false,
    }),
    user: r.one.user({ from: r.discountRedemption.userId, to: r.user.id }),
  },
}));

export { relations };
