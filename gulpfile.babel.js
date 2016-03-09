import gulp from 'gulp'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import copy from 'gulp-copy'
import del from 'del'
import sequence from 'run-sequence'
import gutil from 'gulp-util'

import WebpackDevServer from 'webpack-dev-server'

import WEBPACK_CONFIG from './webpack.config'

const path = {
  ENTRY: './src/main.js',
  DEST: 'dist/',
  INDEX: './index.html',
}

const dev = {
  PORT: 8080,
  HOST: 'localhost',
}

gulp.task('default', ['build'])

gulp.task('build', () => sequence('clean', 'build:webpack', 'build:dist'))

gulp.task('clean', () => del([path.DEST]))

gulp.task('build:dist', () =>
  gulp.src(path.INDEX)
  .pipe(copy(path.DEST))
)

gulp.task('build:webpack', () =>
  gulp.src(path.ENTRY)
  .pipe(webpackStream(WEBPACK_CONFIG))
  .pipe(gulp.dest(path.DEST))
)

gulp.task('serve', cb => {
  const log = msg => gutil.log('[webpack-dev-server]', msg)

  const config = Object.create(WEBPACK_CONFIG)
  // config.devtool = 'cheap-module-eval-source-map'
  config.devtool = 'eval'
  config.debug = true

  log('Creating dev server...')
  const server = new WebpackDevServer(webpack(config), {
    publicPath: '/',
    inline: true,
    historyApiFallback: true,
    stats: {colors: true}
  })

  log('...starting to listen...')
  server.listen(dev.PORT, dev.HOST, err => {
    if (err) { throw new gutil.PluginError('webpack-dev-server', err) }
    log(`http://${dev.HOST}:${dev.PORT}/webpack-dev-server/index.html`)
  })
})
