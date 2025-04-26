const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "index_bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: /node_modules/,
        resolve: {
          fullySpecified: false,
        },
      },
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
        use: ["style-loader","css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "OmicsDM",
      myPageHeader: "OmicsDM",
      template: "public/asset/index.html",
      filename: "index.html",
    }),
    new CopyWebpackPlugin([
      { from: "./src/img", to: "images" },
      // { from: 'public', to: '.' },
    ]),
  ],
};
