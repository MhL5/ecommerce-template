import z from "zod";

type Zod = typeof z;

z.config(z.locales["fa"]());

const localizedZod = z;

export { localizedZod, type Zod };
