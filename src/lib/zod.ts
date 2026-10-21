import * as z from "zod";

type Zod = typeof z;

z.config(z.locales["fa"]());

export { z, type Zod };
