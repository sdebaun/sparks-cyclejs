var path = require('path')
var webpack = require('webpack')

var TapWebpackPlugin = require('tap-webpack-plugin')

var ENV = process.env.NODE_ENV

var srcPath = path.join(__dirname, '/src')
var imagePath = path.join(__dirname, '/images')

module.exports = [
  // main bundle
  {
    entry: ['./src/main'],
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'bundle.js',
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
    plugins: ENV === 'production' ?
      [new webpack.optimize.UglifyJsPlugin({minimize: true})] : [],
  },

  // test bundle
  {
    target: 'node',
    debug: true,
    devtool: 'eval',
    entry: ['./src/main.test.js'],
    output: {
      path: path.join(__dirname, 'tests'),
      filename: 'bundle.js',
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          loaders: ['babel', 'eslint'],
          include: __dirname,
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new TapWebpackPlugin(),
    ],
  },
]

// module.exports = {
//   entry: ['./src/main'],
//   output: {
//     path: path.join(__dirname, 'dist'),
//     filename: 'bundle.js',
//   },
//   module: {
//     loaders: [
//       {
//         test: /\.js$/,
//         loaders: ['babel', 'eslint'],
//         include: __dirname,
//         exclude: /node_modules/,
//       },
//       {
//         test: /\.css$/,
//         loader: 'style-loader!css-loader?sourceMap',
//         include: __dirname,
//       },
//       {
//         test: /\.scss/,
//         loaders: [
//           'style-loader',
//           'css-loader',
//           'postcss-loader',
//           'sass-loader?outputStyle=expanded',
//         ],
//       },
//       {
//         test: /\.(jpe?g|png|gif|svg)$/i,
//         loaders: [
//           'file?hash=sha512&digest=hex&name=[hash].[ext]',
//           'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false',
//         ],
//       },
//     ],
//   },
//   resolve: {
//     alias: {
//       drivers: srcPath + '/drivers',
//       components: srcPath + '/components',
//       helpers: srcPath + '/helpers',
//       root: srcPath + '/root',
//       images: imagePath,
//       util: srcPath + '/util',
//       remote: srcPath + '/remote',
//     },
//   },
//   plugins: ENV === 'production' ?
//     [new webpack.optimize.UglifyJsPlugin({minimize: true})] : [],
// }
