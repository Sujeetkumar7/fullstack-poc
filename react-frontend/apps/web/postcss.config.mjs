// apps/web/postcss.config.mjs
export default {
  plugins: {
    "postcss-react-strict-dom": {
      include: [
        "node_modules/react-strict-dom/dist/dom/runtime.js",
        "src/**/*.{js,jsx,ts,tsx}",
        "../../packages/ui/src/**/*.{js,jsx,ts,tsx}", // path from apps/web → packages/ui
      ],
    },
    autoprefixer: {},
  },
};
