import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "dist/**",
      "public/workers/**",
      "next-env.d.ts",
      "*.tsbuildinfo",
    ],
  },
  ...nextCoreWebVitals,
];

export default config;
