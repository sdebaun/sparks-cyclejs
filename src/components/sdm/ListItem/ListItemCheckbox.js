import {ListItemClickable} from './ListItemClickable'
import {CheckboxControl} from 'components/sdm'

export const ListItemCheckbox = sources => {
  const cb = CheckboxControl(sources)

  const item = ListItemClickable({...sources,
    rightDOM$: cb.DOM,
    title$: sources.value$.flatMapLatest(v =>
      sources.title$ ||
      (v ? sources.titleTrue$ : sources.titleFalse$)
    ),
  })

  const value$ = item.click$
    .withLatestFrom(sources.value$)
  // const value$ = sources.value$
  //   .sample(item.click$)
    .map(x => !x)

  return {
    DOM: item.DOM,
    value$,
  }
}
