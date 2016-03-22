import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'
import {log} from 'util'

const Form = sources => {
  // sources.Controls$ is an array of components

  // controls$ is array of the created components (sink collections technically)
  const controls$ = sources.Controls$.map(Controls =>
    Controls.map(({field,Control}) => ({field, control: Control(sources)}))
  )

  const reduceControls = controls => {
    const foo = controls.reduce((a, {field,control}) =>
      (a[field] = control.value$) && a, {}
    )
    console.log('reduced', foo)
    return foo
  }

  // item$ gets their values$
  const item$ = controls$.flatMapLatest(controls =>
    combineLatestObj(reduceControls(controls))
  )

  item$.subscribe(log('item$'))

  const DOM = controls$.map(controls =>
    div({}, controls.map(({control}) => control.DOM))
  )

  return {
    DOM,
    item$,
  }
}

export {Form}
