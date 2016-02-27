import {Observable} from 'rx'
import {div} from 'cycle-snabbdom'

// TODO: implement
export default (sources) => ({
  DOM: Observable.just(div({})),
})
