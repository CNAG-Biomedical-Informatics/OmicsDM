const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: ["./public/config.js", "./src/index.js"],
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "index_bundle.js",
  },
  watch: false,
  devServer: {
    // host: "0.0.0.0",
    host: "localhost",
    port: 5000,
    historyApiFallback: true,
  },
  devtool: "eval-source-map",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        resolve: {
          extensions: [".js", ".jsx", ".tsx"],
        },
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/transform-runtime"],
          },
        },
      },
      {
        test: /\.(jpe?g|png|gif|svg|xlsx)$/i,
        use: ["file-loader"],
      },
      {
        test: /\.css$/,
        use: ["css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "OmicSDM",
      myPageHeader: "OmicSDM",
      template: "public/index.html",
      filename: "index.html",
    }),
    new CopyWebpackPlugin([{ from: "./src/img", to: "images" }]),
  ],
};
