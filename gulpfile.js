'use strict';

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackStream = require('webpack-stream');

var _webpackStream2 = _interopRequireDefault(_webpackStream);

var _gulpCopy = require('gulp-copy');

var _gulpCopy2 = _interopRequireDefault(_gulpCopy);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

var _gulpSurge = require('gulp-surge');

var _gulpSurge2 = _interopRequireDefault(_gulpSurge);

var _gulpTape = require('gulp-tape');

var _gulpTape2 = _interopRequireDefault(_gulpTape);

var _faucet = require('faucet');

var _faucet2 = _interopRequireDefault(_faucet);

var _tapXunit = require('tap-xunit');

var _tapXunit2 = _interopRequireDefault(_tapXunit);

var _vinylSourceStream = require('vinyl-source-stream');

var _vinylSourceStream2 = _interopRequireDefault(_vinylSourceStream);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _webpack3 = require('./webpack.config');

var _webpack4 = _interopRequireDefault(_webpack3);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var args = (0, _minimist2.default)(process.argv.slice(2));

var path = {
  TEST_SRC: './src/**/*.test.js',
  TEST_RESULT: './',
  ENTRY: './src/main.js',
  DEST: 'dist/',
  INDEX: './index.html'
};

var dev = {
  PORT: 8080,
  HOST: 'localhost'
};

_gulp2.default.task('default', ['build']);

_gulp2.default.task('build', function (cb) {
  return (0, _runSequence2.default)('clean', 'build:webpack', 'build:dist', cb);
});

_gulp2.default.task('clean', function () {
  return (0, _del2.default)([path.DEST]);
});

_gulp2.default.task('build:dist', function () {
  return _gulp2.default.src(path.INDEX).pipe((0, _gulpCopy2.default)(path.DEST));
});

_gulp2.default.task('build:webpack', function () {
  return _gulp2.default.src(path.ENTRY).pipe((0, _webpackStream2.default)(_webpack4.default)).pipe(_gulp2.default.dest(path.DEST));
});

_gulp2.default.task('serve', function (cb) {
  var log = function log(msg) {
    return _gulpUtil2.default.log('[webpack-dev-server]', msg);
  };

  var config = Object.create(_webpack4.default);
  // config.devtool = 'cheap-module-eval-source-map'
  config.devtool = 'eval';
  config.debug = true;

  log('Creating dev server...');
  var server = new _webpackDevServer2.default((0, _webpack2.default)(config), {
    publicPath: '/',
    inline: true,
    historyApiFallback: true,
    stats: { colors: true }
  });

  log('...starting to listen...');
  server.listen(dev.PORT, dev.HOST, function (err) {
    if (err) {
      throw new _gulpUtil2.default.PluginError('webpack-dev-server', err);
    }
    log('http://' + dev.HOST + ':' + dev.PORT + '/webpack-dev-server/index.html');
  });
});

_gulp2.default.task('deploy', ['build'], function (cb) {
  // --domain some.host.name
  var log = function log(msg) {
    return _gulpUtil2.default.log('[surge]', msg);
  };
  var domain = args.domain;
  var project = path.DEST;

  log('Starting surge deployment of ' + project + ' to ' + domain + ' ...');
  return (0, _gulpSurge2.default)({ project: project, domain: domain });
});

_gulp2.default.task('test', function () {
  return _gulp2.default.src(path.TEST_SRC).pipe((0, _gulpTape2.default)({ reporter: (0, _faucet2.default)() }));
});

_gulp2.default.task('test:xunit', function () {
  // --out $CIRCLE_TEST_REPORTS
  var destPath = args.out || './';

  var outputStream = (0, _tapXunit2.default)();
  var vinylOutput = outputStream.pipe((0, _vinylSourceStream2.default)('results.xml'));

  _gulp2.default.src(path.TEST_SRC).pipe((0, _gulpTape2.default)({ outputStream: outputStream }));

  return vinylOutput.pipe(_gulp2.default.dest(destPath));
});
