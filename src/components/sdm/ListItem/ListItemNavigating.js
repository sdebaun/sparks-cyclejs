import {Observable as $} from 'rx'
import {ListItemClickable} from './ListItemClickable'

export const ListItemNavigating = sources => {
  const item = ListItemClickable(sources)

  const route$ = item.click$
    .withLatestFrom(
      sources.path$ || $.just('/'),
      (cl,p) => p,
    )

  return {
    DOM: item.DOM,
    route$,
  }
}
