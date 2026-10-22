type UserRole = "customer" | "admin";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** SHA-256 of `northstar:<password>` — mock auth, never plaintext. */
  passwordHash: string;
  createdAt: string;
};

/** What the UI is allowed to see about a user. */
type PublicUser = Omit<User, "passwordHash">;

export type { PublicUser, User, UserRole };
