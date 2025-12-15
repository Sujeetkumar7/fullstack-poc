module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      [
        "react-strict-dom/babel-preset",
        { target: "native", dev: process.env.NODE_ENV !== "production" },
      ],
    ],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
          alias: {
            "@rsd/ui": require("path").join(__dirname, "../../packages/ui/src"),
          },
        },
      ],
    ],
  };
};
