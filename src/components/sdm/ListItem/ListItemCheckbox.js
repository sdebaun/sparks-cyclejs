import {ListItemClickable} from './ListItemClickable'
import {CheckboxControl} from 'components/sdm'

export const ListItemCheckbox = sources => {
  const cb = CheckboxControl(sources)

  const item = ListItemClickable({...sources,
    leftDOM$: sources.leftDOM$ || cb.DOM,
    title$: sources.value$.flatMapLatest(v =>
      sources.title$ ||
      (v ? sources.titleTrue$ : sources.titleFalse$)
    ),
    rightDOM$: sources.rightDOM$ || sources.leftDOM$ && cb.DOM,
  })

  const value$ = item.click$
    .withLatestFrom(sources.value$)
    .map(click_and_val => !click_and_val[1])

  return {
    DOM: item.DOM,
    value$,
  }
}
