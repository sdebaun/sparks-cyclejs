import smith from './static'
import webpack from 'webpack'

const webpackConfig = require('./webpack.config')
const compiler = webpack(webpackConfig)

console.log('Metalsmith build')
smith.build(err => {
  if (err) {
    console.error('Metalsmith error', err)
    process.exit(1)
  }
  console.log('Metalsmith built')
})

console.log('Webpack build')
compiler.run(err => {
  if (err) {
    console.error('Webpack error', err)
    process.exit(1)
  }

  console.log('Webpack built')
})
