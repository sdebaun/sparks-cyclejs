import {Observable} from 'rx'
import {div} from 'cycle-snabbdom'

export default name => sources => ({
  DOM: Observable.just(div({},'Coming Soon: ' + name)),
})
