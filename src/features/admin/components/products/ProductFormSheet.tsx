"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  type ProductFormErrors,
  type ProductFormValues,
  toFormValues,
  toNewProduct,
  validateProductForm,
} from "@/features/admin/utils/product-form";
import { getCategories } from "@/features/products/api";
import {
  createProduct,
  updateProduct,
} from "@/features/products/api/catalog-store";
import type { CategoryId, Product } from "@/features/products/types";
import { useState } from "react";

const categoryItems = getCategories().map((category) => ({
  value: category.id,
  label: category.name,
}));

function MoneyField({
  name,
  label,
  value,
  error,
  description,
  onChange,
}: {
  name: "price" | "compareAtPrice";
  label: string;
  value: string;
  error?: string;
  description?: string;
  onChange: (value: string) => void;
}) {
  const id = `product-${name}`;
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          inputMode="decimal"
          value={value}
          aria-invalid={!!error}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        description && <FieldDescription>{description}</FieldDescription>
      )}
    </Field>
  );
}

type ProductFormSheetProps = {
  /** The product being edited, or `null` to create a new one. */
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Create / edit form. The parent mounts it with a `key` per product, so the
 * form state starts fresh for each one.
 */
function ProductFormSheet({
  product,
  open,
  onOpenChange,
}: ProductFormSheetProps) {
  const [values, setValues] = useState(() =>
    toFormValues(product ?? undefined),
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const editing = product !== null;

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateProductForm(values);
    if (!result.success) {
      setErrors(result.errors);
      const form = event.currentTarget;
      requestAnimationFrame(() =>
        form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(),
      );
      return;
    }

    if (product) {
      updateProduct(product.id, result.data);
      toast.add({
        type: "success",
        title: "Product updated",
        description: result.data.name,
      });
    } else {
      const created = createProduct(toNewProduct(result.data));
      toast.add({
        type: "success",
        title: "Product created",
        description: `${created.name} is now live in the shop.`,
      });
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>{editing ? "Edit product" : "Add product"}</SheetTitle>
          <SheetDescription>
            {editing
              ? `Changes apply to the shop straight away (saved in this browser).`
              : "New products appear in the shop straight away (saved in this browser)."}
          </SheetDescription>
        </SheetHeader>
        <form
          noValidate
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <ScrollArea className="min-h-0 flex-1">
            <FieldGroup className="gap-5 p-4">
              <TextField
                name="name"
                idPrefix="product"
                label="Name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                error={errors.name}
                description={
                  editing
                    ? "The product URL stays the same if you rename it."
                    : undefined
                }
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  name="brand"
                  idPrefix="product"
                  label="Brand"
                  value={values.brand}
                  onChange={(event) => set("brand", event.target.value)}
                  error={errors.brand}
                />
                <Field data-invalid={!!errors.categoryId}>
                  <FieldLabel htmlFor="product-category">Category</FieldLabel>
                  <Select
                    items={categoryItems}
                    value={values.categoryId}
                    onValueChange={(value) => {
                      if (value) set("categoryId", value as CategoryId);
                    }}
                  >
                    <SelectTrigger id="product-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categoryItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <FieldError>{errors.categoryId}</FieldError>
                  )}
                </Field>
              </div>

              <FieldSeparator>Pricing & stock</FieldSeparator>

              <div className="grid gap-5 sm:grid-cols-2">
                <MoneyField
                  name="price"
                  label="Price"
                  value={values.price}
                  error={errors.price}
                  onChange={(value) => set("price", value)}
                />
                <MoneyField
                  name="compareAtPrice"
                  label="Compare-at price"
                  value={values.compareAtPrice}
                  error={errors.compareAtPrice}
                  description="Optional. Set it to show the product on sale."
                  onChange={(value) => set("compareAtPrice", value)}
                />
              </div>
              <TextField
                name="stock"
                idPrefix="product"
                label="Stock"
                inputMode="numeric"
                value={values.stock}
                onChange={(event) => set("stock", event.target.value)}
                error={errors.stock}
                description="Units available. 0 marks it sold out."
              />

              <FieldSeparator>Details</FieldSeparator>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="product-description">
                  Description
                </FieldLabel>
                <Textarea
                  id="product-description"
                  rows={4}
                  value={values.description}
                  aria-invalid={!!errors.description}
                  onChange={(event) => set("description", event.target.value)}
                />
                {errors.description && (
                  <FieldError>{errors.description}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="product-highlights">Highlights</FieldLabel>
                <Textarea
                  id="product-highlights"
                  rows={3}
                  value={values.highlights}
                  placeholder={"Water resistant to 50 m\n7-day battery life"}
                  onChange={(event) => set("highlights", event.target.value)}
                />
                <FieldDescription>One per line.</FieldDescription>
              </Field>
              <TextField
                name="tags"
                idPrefix="product"
                label="Tags"
                value={values.tags}
                placeholder="audio, wireless"
                onChange={(event) => set("tags", event.target.value)}
                description="Comma-separated. Used by search and related products."
              />
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="product-featured">Featured</FieldLabel>
                  <FieldDescription>
                    Shown on the home page and first in “Featured” sorting.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="product-featured"
                  aria-label="Featured"
                  checked={values.featured}
                  onCheckedChange={(checked) => set("featured", checked)}
                />
              </Field>
            </FieldGroup>
          </ScrollArea>
          <SheetFooter className="flex-row justify-end border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editing ? "Save changes" : "Create product"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export { ProductFormSheet };
