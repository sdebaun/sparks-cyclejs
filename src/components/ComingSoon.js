import {Observable} from 'rx'
import {h} from 'cycle-snabbdom'

export default name => () => ({
  DOM: Observable.just(h('h4', {},'Coming Soon: ' + name)),
})
