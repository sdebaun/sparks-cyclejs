import fs from 'fs'
import path from 'path'
import express from 'express'
import Handlebars from 'handlebars'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import smith from './static'
import smithWatch from 'metalsmith-watch'
import browserSync from 'browser-sync'

const port = process.env.PORT || 3000
const app = express()
const env = app.get('env')

if (env === 'development') {
  const webpackConfig = require('./webpack.config')
  const compiler = webpack(webpackConfig)
  const hot = webpackHotMiddleware(compiler)
  const sync = browserSync.create()

  app.use(webpackDevMiddleware(compiler, webpackConfig.devServer))
  app.use(hot)

  sync.init({
    proxy: `localhost:${port}`,
    notify: false,
  }, () => {
    console.log('BrowserSync ready')
  })

  sync.watch('static/build/*.html').on('change', sync.reload)
  sync.watch('static/build/**/*.css', {
    awaitWriteFinish: {
      stabilityThreshold: 1000,
    }}).on('change', () => sync.reload('*.css'))
  sync.watch('static/src/**/*').on('change', () => smith.build(err => {
    if (err) { return console.log('build error') }
    console.log('rebuilt')
  }))

  // smith.use(smithWatch({
  //   'src/site/**/*': true,
  //   'src/layouts/*': '**/*',
  //   livereload: true,
  // }))

  smith.build(err => {
    if (err) {
      console.error('Metalsmith error', err)
      process.exit(1)
    }
    console.log('Metalsmith built')
  })
}

app.use(express.static('dist'))
app.use(express.static('static/build'))

const compileHtml = () => {
  const indexSource = fs.readFileSync(`./index-${env}.html`, {encoding: 'utf-8'})
  const template = Handlebars.compile(indexSource)
  const html = template({...process.env})
  return html
}

const html = compileHtml()

app.get('*', (req, res) => {
  if (env === 'development') {
    res.send(compileHtml())
  } else {
    res.send(html)
  }
})

app.listen(port, () => console.log(`Listening on ${port}`))

export default app
