import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [".next/**", "coverage/**", "node_modules/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      "react/jsx-key": "error",
      "@next/next/no-img-element": "error",
    },
  },
];

export default config;
