import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "vite-plugin-babel";

export default defineConfig({
  plugins: [
    react(),
    babel({
      filter: (id: string) =>
        /\.(jsx?|tsx?)$/.test(id) &&
        (id.includes("/apps/web/src/") ||
          id.includes("/packages/ui/src/") ||
          id.includes("react-strict-dom")),
    }),
  ],
  ssr: { noExternal: ["react-strict-dom"] },
});
