import {ListItemClickable} from './ListItemClickable'
import {ToggleControl} from 'components/sdm'

export const ListItemToggle = sources => {
  const toggle = ToggleControl(sources)

  const item = ListItemClickable({...sources,
    leftDOM$: toggle.DOM,
    title$: sources.value$.flatMapLatest(v =>
      v ? sources.titleTrue$ : sources.titleFalse$
    ),
  })

  const value$ = sources.value$
    .sample(item.click$)
    .map(x => !x)

  return {
    DOM: item.DOM,
    value$,
  }
}
