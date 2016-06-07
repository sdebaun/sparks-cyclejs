import {Observable as $} from 'rx'
import {div} from 'cycle-snabbdom'

const BlankComponent = () => {
  return {DOM: $.just(div())}
}

export {BlankComponent}
