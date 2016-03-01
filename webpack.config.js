var path = require('path')
var webpack = require('webpack')

var ENV = process.env.NODE_ENV

var srcPath = path.join(__dirname, '/app')

module.exports = {
  entry: ['./app/main'],
  output: {
    filename: './dist/bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel', 'eslint'],
        include: __dirname,
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?sourceMap',
        include: __dirname,
      },
      {
        test: /\.scss/,
        loaders: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader?outputStyle=expanded',
        ],
      },
    ],
  },
  resolve: {
    alias: {
      drivers: srcPath + '/drivers',
      components: srcPath + '/components',
      helpers: srcPath + '/helpers',
      routes: srcPath + '/routes',
    },
  },
  plugins: ENV === 'production' ?
    [new webpack.optimize.UglifyJsPlugin({minimize: true})] : [],
}
