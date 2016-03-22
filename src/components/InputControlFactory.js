import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {Input} from 'snabbdom-material'

import {log} from 'util'

export default ({label, className}) => sources => {
  // render is nested so it can use factory args
  const _render = ({value}) =>
    Input({label, className, value})

  const input$ = sources.DOM.select('.' + className).events('input')
  input$.subscribe(log('input$'))

  const value$ = (sources.value$ || Observable.just(null))
    .merge(input$.pluck('target','value'))

  const DOM = combineLatestObj({value$}).map(_render)

  return {DOM, value$}
}
