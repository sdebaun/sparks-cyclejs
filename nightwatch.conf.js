module.exports = (settings => {
  if (process.platform === 'win32') {
    settings.selenium.cli_args['webdriver.chrome.driver'] =
      './node_modules/.bin/chromedriver.cmd'
  }
  return settings
})(require('./nightwatch.json'))
