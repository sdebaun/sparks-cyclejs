import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {Input,Select} from 'snabbdom-material'

import {col} from 'helpers'

import {log} from 'util'

const optionIndex = e => // because children is not a real js array
  [...e.target.parentNode.children].indexOf(e.target)

export default ({label, options, className, defaultValue}) => sources => {
  // render is nested so it can use factory args
  const _render = ({isOpen, value}) =>
    Select({label, options, className, isOpen, value})

  const selection$ = sources.DOM.select('.menu-item').events('click')
    .map(e => options[optionIndex(e)].value)

  const openClick$ = sources.DOM.select('.input-group').events('click')

  const closeClick$ = sources.DOM.select('.mask').events('click')

  const isOpen$ = Observable.merge(
    openClick$.map(true),
    selection$.map(false),
    closeClick$.map(false),
  ).startWith(false)

  const value$ = sources.value$ || Observable.just(defaultValue)
    .merge(selection$)

  const DOM = combineLatestObj({value$, isOpen$}).map(_render)

  return {DOM, value$}
}
