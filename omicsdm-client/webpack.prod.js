const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  // entry: ["./public/config.js", "./src/index.js"],
  entry: ["./src/index.js"],
  mode: 'production',
  devtool: 'source-map'
});