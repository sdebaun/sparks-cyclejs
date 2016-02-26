var path = require('path');
var webpack = require('webpack');

var ENV = process.env.NODE_ENV;

var srcPath = path.join(__dirname, '/js');

module.exports = {
  entry: ['./js/main'],
  output: {
    filename: './dist/bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: __dirname,
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?sourceMap',
        include: __dirname
      }
    ]
  },
  resolve: {
    alias: {
      drivers: srcPath + '/drivers',
      components: srcPath + '/components'
    }
  },
  plugins: (ENV == 'production'
            ? [new webpack.optimize.UglifyJsPlugin({minimize: true})]
            : [])
};
