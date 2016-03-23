import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import {div} from 'helpers'
// import {log} from 'util'

const pluckStartValue = (item$, field) =>
  item$ && item$.map(i => i[field]) || just(null)

const reduceControlsToObject = controls =>
  controls.reduce((a, {field,control}) =>
    field && (a[field] = control.value$) && a || a, {}
  )

const Form = sources => {
  // sources.Controls$ is an array of components

  // controls$ is array of the created components (sink collections technically)
  const controls$ = sources.Controls$.map(Controls =>
    Controls.map(({field,Control}) => ({
      field,
      control: isolate(Control,field)({
        ...sources,
        value$: pluckStartValue(sources.item$, field),
      }),
    }))
  ).shareReplay(1) // keeps it from being pwnd every time

  // item$ gets their values$
  const item$ = controls$.flatMapLatest(controls =>
    combineLatestObj(reduceControlsToObject(controls))
  )

  const DOM = controls$.map(controls =>
    div({}, controls.map(({control}) => control.DOM))
  )

  return {
    DOM,
    item$,
  }
}

export {Form}
