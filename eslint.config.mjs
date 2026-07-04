import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // INFO2222/ is the reference project the security implementation was
    // adapted from — it has its own toolchain and is not part of this app.
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "INFO2222/**"],
  },
];

export default eslintConfig;
