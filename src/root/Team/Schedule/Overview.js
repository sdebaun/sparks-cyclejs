import {Observable} from 'rx'
const {of} = Observable
import {h} from 'cycle-snabbdom'

export default () => {
  return {
    DOM: of(h('p', {}, 'Choose a day to start adding shifts!')),
  }
}
