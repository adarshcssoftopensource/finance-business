const webpack = require("webpack");

module.exports = {
  style: {
    postcss: {
      mode: "extends",
      plugins: [],
    },
  },

  webpack: {
    configure: (webpackConfig) => {
      // Fix for webpack 5 node polyfills
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: require.resolve("stream-browserify"),
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
        })
      );

      // Your existing CssMinimizer removal
      if (webpackConfig.optimization && webpackConfig.optimization.minimizer) {
        webpackConfig.optimization.minimizer =
          webpackConfig.optimization.minimizer.filter(
            (plugin) => plugin.constructor.name !== "CssMinimizerPlugin"
          );
      }

      return webpackConfig;
    },
  },
};