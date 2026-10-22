import { seedUsers } from "@/features/auth/api/data/users";
import type { PublicUser, User } from "@/features/auth/types";
import { createLocalStore } from "@/lib/createLocalStore";
import { z } from "zod";

/*
 * Mock authentication. Accounts created through /register live in
 * localStorage next to the seeded demo users; the "session" is just the
 * signed-in user id. Nothing here is secure — it only simulates the flows.
 */

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["customer", "admin"]),
  passwordHash: z.string(),
  createdAt: z.string(),
});

const registeredUsersStore = createLocalStore<{ users: User[] }>(
  "northstar:users",
  { users: [] },
  z.object({ users: z.array(userSchema) }),
);

const sessionStore = createLocalStore<{ userId: string | null }>(
  "northstar:session",
  { userId: null },
  z.object({ userId: z.string().nullable() }),
);

/**
 * Profile edits by user id. Seed users live in a TS file, so their changes
 * (and everyone else's, for one code path) are stored as overrides.
 */
type ProfileOverride = { name?: string; passwordHash?: string };

const profileStore = createLocalStore<Record<string, ProfileOverride>>(
  "northstar:profiles",
  {},
  z.record(
    z.string(),
    z.object({
      name: z.string().optional(),
      passwordHash: z.string().optional(),
    }),
  ),
);

async function hashPassword(password: string) {
  const bytes = new TextEncoder().encode(`northstar:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function allUsers(
  registered = registeredUsersStore.getState().users,
  profiles = profileStore.getState(),
): User[] {
  return [...seedUsers, ...registered].map((user) => {
    const override = profiles[user.id];
    return override ? { ...user, ...override } : user;
  });
}

function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return allUsers().find((user) => user.email.toLowerCase() === normalized);
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/** Simulated network latency so loading states are visible. */
function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type AuthResult =
  | { ok: true; user: PublicUser }
  | { ok: false; error: string; field?: "email" | "password" };

async function login(email: string, password: string): Promise<AuthResult> {
  await delay();
  const user = findUserByEmail(email);
  if (!user || user.passwordHash !== (await hashPassword(password))) {
    return { ok: false, error: "Email or password is incorrect." };
  }
  sessionStore.setState({ userId: user.id });
  return { ok: true, user: toPublicUser(user) };
}

async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  await delay();
  if (findUserByEmail(input.email)) {
    return {
      ok: false,
      field: "email",
      error: "An account with this email already exists.",
    };
  }

  const user: User = {
    id: `u-${crypto.randomUUID()}`,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: "customer",
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  registeredUsersStore.setState((state) => ({
    users: [...state.users, user],
  }));
  sessionStore.setState({ userId: user.id });
  return { ok: true, user: toPublicUser(user) };
}

function logout() {
  sessionStore.setState({ userId: null });
}

function updateProfile(userId: string, profile: { name: string }) {
  profileStore.setState((profiles) => ({
    ...profiles,
    [userId]: { ...profiles[userId], name: profile.name.trim() },
  }));
}

async function changePassword(
  userId: string,
  currentPassword: string,
  nextPassword: string,
): Promise<AuthResult> {
  await delay();
  const user = allUsers().find((candidate) => candidate.id === userId);
  if (!user) return { ok: false, error: "You’re not signed in." };
  if (user.passwordHash !== (await hashPassword(currentPassword))) {
    return {
      ok: false,
      field: "password",
      error: "Your current password is incorrect.",
    };
  }
  const passwordHash = await hashPassword(nextPassword);
  profileStore.setState((profiles) => ({
    ...profiles,
    [userId]: { ...profiles[userId], passwordHash },
  }));
  return { ok: true, user: toPublicUser({ ...user, passwordHash }) };
}

/** The signed-in user, or `null`. Re-renders on login/logout in any tab. */
function useSessionUser(): PublicUser | null {
  const { userId } = sessionStore.useStore();
  const { users } = registeredUsersStore.useStore();
  const profiles = profileStore.useStore();
  if (!userId) return null;
  const user = allUsers(users, profiles).find(
    (candidate) => candidate.id === userId,
  );
  return user ? toPublicUser(user) : null;
}

/** Every account (seed + registered) without password hashes, for the admin. */
function useAllUsers(): PublicUser[] {
  const { users } = registeredUsersStore.useStore();
  const profiles = profileStore.useStore();
  return allUsers(users, profiles).map(toPublicUser);
}

export {
  changePassword,
  updateProfile,
  useAllUsers,
  hashPassword,
  login,
  logout,
  register,
  sessionStore,
  useSessionUser,
  type AuthResult,
};
