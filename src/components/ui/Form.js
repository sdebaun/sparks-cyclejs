import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'

const Form = sources => {
  // sources.Controls$ is an array of components

  // controls$ is array of the created components (sink collections technically)
  const controls$ = sources.Controls$.map(Controls =>
    Controls.map(({field,Control}) => ({field, control: Control(sources)}))
  )

  // item$ gets their values$
  const item$ = controls$.flatMapLatest(controls =>
    combineLatestObj(
      controls.reduce((a, {field,control}) =>
        (a[field] = control.value$) && a, {}
      )
    )
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
