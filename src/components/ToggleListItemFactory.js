import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {Checkbox} from 'snabbdom-material'

import listItem from 'helpers/listItem'
import {icon} from 'helpers'

// import {col} from 'helpers'

import {log} from 'util'

export default ({labelTrue, labelFalse}) => sources => {
  // render is nested so it can use factory args
  const _render = ({value}) =>
    listItem({
      iconDOM: value ? icon('toggle-on','green') : icon('toggle-off','#333'),
      title: value ? labelTrue : labelFalse,
      clickable: true,
    })

  const toggleClick$ = sources.DOM.select('.clickable').events('click')

  toggleClick$.subscribe(log('toggleClick$'))

  const sourceValue$ = sources.value$ || Observable.just(false)

  const value$ = sourceValue$
    .sample(toggleClick$)
    .map(value => !value)

  value$.subscribe(log('value$'))

  const viewState = {
    value$: sourceValue$,
  }
  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, value$}
}
