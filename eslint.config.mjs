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
    // The WebGL layer from the previous design. Nothing imports it any more;
    // it is also excluded in tsconfig.json until it is deleted.
    "src/components/three/**",
    "src/components/ui/ViewSlot.tsx",
    "src/components/ui/HeroProgress.tsx",
    "src/components/PushToCopy.tsx",
    "src/components/SkillBoard.tsx",
    "src/components/ProjectShowcase.tsx",
    "src/lib/stage.ts",
    "src/lib/palette.ts",
  ]),
]);

export default eslintConfig;
