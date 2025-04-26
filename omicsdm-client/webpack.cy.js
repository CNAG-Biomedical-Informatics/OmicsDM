const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  entry: ["./config_test.js", "./src/index.js"],
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    // host: "0.0.0.0",
    host: "localhost",
    port: 5000,
    historyApiFallback: true,
  },
  watchOptions: {
    ignored: /node_modules/,
  },
});
