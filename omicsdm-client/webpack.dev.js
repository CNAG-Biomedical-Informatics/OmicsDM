const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

// TODO
// figure out how to overwrite the config.js
// because on Master the config_test.js has to be used
// because the sso url should point to sso.dev and not sso.eu

module.exports = merge(common, {
  // entry: ["./public/config.js", "./src/index.js"],
  entry: ["./src/index.js"],
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    // contentBase: path.join(__dirname, "build"),
    compress: true,
    // host: "0.0.0.0",
    host: "localhost",
    port: 5000,
    historyApiFallback: true,
  },
  watchOptions: {
    ignored: /node_modules/,
  },
});
