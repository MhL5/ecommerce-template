const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "IE", label: "Ireland" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
  { value: "SE", label: "Sweden" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "New Zealand" },
] as const;

function countryName(code: string) {
  return COUNTRIES.find((country) => country.value === code)?.label ?? code;
}

export { COUNTRIES, countryName };
