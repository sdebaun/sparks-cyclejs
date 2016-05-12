require('./styles.scss')
import {div} from 'cycle-snabbdom'

const EnvBanner = () =>
  process.env.BUILD_ENV === 'production' ?
  null :
  div('.env-banner', [process.env.BUILD_ENV])

export default EnvBanner
