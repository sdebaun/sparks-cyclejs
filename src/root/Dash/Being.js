import {h} from 'cycle-snabbdom'
import {Observable} from 'rx'
const {of} = Observable

export default () => ({
  DOM: of(h('h4', {}, 'About you')),
})
