var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')

if (!process.env.BUILD_ENV) {
  process.env.BUILD_ENV = 'development'
}
var ENV = process.env.BUILD_ENV

console.log('webpack run with FIREBASE_URL', process.env.FIREBASE_URL)

if (!process.env.FIREBASE_URL) { console.log('Need FIREBASE_URL env var'); process.exit()}

var srcPath = path.join(__dirname, '/src')
var imagePath = path.join(__dirname, '/images')

console.log(ENV);
var basePlugins = [
  new CopyWebpackPlugin([
    {from: './200.html'},
  ]),
  new webpack.EnvironmentPlugin([
    'BUILD_ENV',
    'FIREBASE_URL',
    'FIREBASE_API_KEY',
    'AUTH_DOMAIN',
    'STORAGE_BUCKET'
  ]),
]

var prodPlugins = [
  new webpack.optimize.UglifyJsPlugin({minimize: true}),
]

var plugins = basePlugins.concat(ENV == 'production' ? prodPlugins : [])

module.exports = {
  entry: ['./src/main'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    hot: true,
    inline: true,
    historyApiFallback: true,
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
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false',
        ],
      },
    ],
  },
  externals: {
    Bugsnag: 'Bugsnag',
  },
  resolve: {
    alias: {
      drivers: srcPath + '/drivers',
      components: srcPath + '/components',
      helpers: srcPath + '/helpers',
      root: srcPath + '/root',
      images: imagePath,
      util: srcPath + '/util',
      remote: srcPath + '/remote',
    },
  },
  plugins: plugins,
}
