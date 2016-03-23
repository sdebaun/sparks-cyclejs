import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'
import listItem from 'helpers/listItem'
import {icon} from 'helpers'
import {ToggleControl} from 'components/sdm'

// import {col} from 'helpers'

import {log} from 'util'

export default ({labelTrue, labelFalse}) => sources => {
  const toggle = ToggleControl(sources)

  // render is nested so it can use factory args
  const _render = ({value, toggleDOM}) =>
    listItem({
      iconDOM: toggleDOM,
      title: value ? labelTrue : labelFalse,
      clickable: true,
    })

  // const toggleClick$ = sources.DOM.select('.clickable').events('click')
  const value$ = toggle.value$

  // toggleClick$.subscribe(log('toggleClick$'))

  // const sourceValue$ = sources.value$ || Observable.just(false)

  // const value$ = sourceValue$
  //   .sample(toggleClick$)
  //   .map(value => !value)

  value$.subscribe(log('value$'))

  const viewState = {
    value$: sources.value$ || just(false),
    toggleDOM$: toggle.DOM,
    // toggleDOM$: just(div({},['wat'])),
  }
  const DOM = combineLatestObj(viewState).map(_render)
  // const DOM = just(div({},['wat']))
  return {DOM, value$}
}
