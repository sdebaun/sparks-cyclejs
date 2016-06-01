import fs from 'fs'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import smith from './static'
import smithWatch from 'metalsmith-watch'

const port = process.env.PORT || 3000

const app = express()

const webpackConfig = require('./webpack.config')
const compiler = webpack(webpackConfig)

app.use(webpackDevMiddleware(compiler, webpackConfig.devServer))
app.use(webpackHotMiddleware(compiler))

app.use(express.static('static/build'))

smith.use(smithWatch({
  'src/site/**/*': true,
  livereload: true,
}))

const index = fs.readFileSync('./index.html', {encoding: 'utf-8'})
app.get('*', (req, res) => {
  res.send(index)
})

smith.build(err => {
  if (err) {
    return console.error('Metalsmith error', err)
  }

  app.listen(port, () => {
    console.log(`Listening on ${port}`)
  })
})

export default app
