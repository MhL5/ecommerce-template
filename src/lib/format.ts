const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

/** Formats an integer amount of cents as USD, e.g. `12999` → `$129.99`. */
function formatPrice(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDate(value: string | number | Date) {
  return dateFormatter.format(new Date(value));
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export { formatDate, formatPrice, pluralize };
