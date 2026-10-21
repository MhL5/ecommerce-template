import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-console": "warn",
      "no-restricted-imports": [
        "error",
        {
          name: "next/image",
          message: "Please import from `@/components/ui/Img` instead.",
          importNames: ["default"],
        },
        {
          name: "next/link",
          message: "Please import Link from `@/components/ui/link` instead.",
          importNames: ["default"],
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
    },
  },
]);

export default eslintConfig;
