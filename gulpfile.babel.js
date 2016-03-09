import gulp from 'gulp'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import copy from 'gulp-copy'
import del from 'del'
import sequence from 'run-sequence'
import gutil from 'gulp-util'
import surge from 'surge'

import WebpackDevServer from 'webpack-dev-server'

import WEBPACK_CONFIG from './webpack.config'

import minimist from 'minimist'

const args = minimist(process.argv.slice(2))

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

gulp.task('build', cb => sequence('clean', 'build:webpack', 'build:dist', cb))

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

gulp.task('deploy', ['build'], cb => {
  const log = msg => gutil.log('[surge]', msg)
  const domain = args.domain
  const project = path.DEST
  
  log('Starting surge deployment of', project, ' to ', domain, '...')
  surge({project, domain})
  log('...surge complete!')
})
