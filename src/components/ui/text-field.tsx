import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ComponentProps } from "react";

type TextFieldProps = Omit<ComponentProps<typeof Input>, "id" | "name"> & {
  name: string;
  label: string;
  error?: string;
  description?: string;
  /** Prefixes the input id when the same field name appears twice on a page. */
  idPrefix?: string;
};

/** Label + input + error in shadcn Field composition. */
function TextField({
  name,
  label,
  error,
  description,
  idPrefix = "field",
  className,
  ...props
}: TextFieldProps) {
  const id = `${idPrefix}-${name}`;
  const describedBy = error
    ? `${id}-error`
    : description
      ? `${id}-description`
      : undefined;

  return (
    <Field data-invalid={!!error} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={name}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <FieldError id={`${id}-error`}>{error}</FieldError>
      ) : (
        description && (
          <FieldDescription id={`${id}-description`}>
            {description}
          </FieldDescription>
        )
      )}
    </Field>
  );
}

export { TextField };
