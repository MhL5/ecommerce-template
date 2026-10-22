import type { User } from "@/features/auth/types";

/**
 * Seeded demo accounts (mock auth — local only, no real backend).
 *
 *   Customer: demo@northstar.test  / demo1234
 *   Admin:    admin@northstar.test / admin1234
 *
 * The login page offers buttons that fill these in.
 */
const DEMO_ACCOUNTS = {
  customer: { email: "demo@northstar.test", password: "demo1234" },
  admin: { email: "admin@northstar.test", password: "admin1234" },
} as const;

const seedUsers: User[] = [
  {
    id: "u-demo",
    name: "Alex Morgan",
    email: DEMO_ACCOUNTS.customer.email,
    role: "customer",
    passwordHash:
      "16e8dea78f9c2014ad716c2a3f10d98b300ba45fecf10e02b92c955297a3a6f0",
    createdAt: "2025-11-02T10:00:00.000Z",
  },
  {
    id: "u-admin",
    name: "Sam Rivera",
    email: DEMO_ACCOUNTS.admin.email,
    role: "admin",
    passwordHash:
      "3bb9cff486a69b99a423a863b77d7c6cb1e75ee598cc31773f9aeb39412b31ef",
    createdAt: "2025-06-15T10:00:00.000Z",
  },
];

/**
 * Background shoppers so the admin's customers and orders pages have data.
 * They can't sign in: no password hashes to "disabled".
 */
const demoShoppers: {
  id: string;
  name: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  joined: string;
}[] = [
  {
    id: "u-c01",
    name: "Jordan Lee",
    city: "Seattle",
    region: "WA",
    postalCode: "98101",
    country: "US",
    joined: "2025-12-04",
  },
  {
    id: "u-c02",
    name: "Priya Shah",
    city: "Toronto",
    region: "ON",
    postalCode: "M5V 2T6",
    country: "CA",
    joined: "2026-01-18",
  },
  {
    id: "u-c03",
    name: "Mateo García",
    city: "Madrid",
    region: "MD",
    postalCode: "28013",
    country: "ES",
    joined: "2026-02-09",
  },
  {
    id: "u-c04",
    name: "Emma Larsen",
    city: "Stockholm",
    region: "AB",
    postalCode: "111 22",
    country: "SE",
    joined: "2026-03-22",
  },
  {
    id: "u-c05",
    name: "Kwame Mensah",
    city: "London",
    region: "LND",
    postalCode: "SE1 9SG",
    country: "GB",
    joined: "2026-04-30",
  },
  {
    id: "u-c06",
    name: "Sophie Bauer",
    city: "Berlin",
    region: "BE",
    postalCode: "10115",
    country: "DE",
    joined: "2026-05-14",
  },
  {
    id: "u-c07",
    name: "Hiro Tanaka",
    city: "Melbourne",
    region: "VIC",
    postalCode: "3000",
    country: "AU",
    joined: "2026-06-27",
  },
  {
    id: "u-c08",
    name: "Nora Okafor",
    city: "Dublin",
    region: "D",
    postalCode: "D02 X285",
    country: "IE",
    joined: "2026-08-11",
  },
];

function shopperEmail(name: string) {
  return `${name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, ".")}@example.test`;
}

seedUsers.push(
  ...demoShoppers.map((shopper): User => ({
    id: shopper.id,
    name: shopper.name,
    email: shopperEmail(shopper.name),
    role: "customer",
    passwordHash: "disabled",
    createdAt: `${shopper.joined}T09:00:00.000Z`,
  })),
);

export { DEMO_ACCOUNTS, demoShoppers, seedUsers, shopperEmail };
