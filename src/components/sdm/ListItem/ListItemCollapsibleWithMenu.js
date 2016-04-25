import {Observable as $} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {ListItemClickable} from './ListItemClickable'

import {div} from 'cycle-snabbdom'

export const ListItemCollapsibleWithMenu = sources => {
  const li = ListItemClickable(sources)

  const isOpen$ = $.merge(
    sources.isOpen$ || $.just(false),
    li.click$.map(-1),
  )
  .scan((acc, next) => next === -1 ? !acc : next, false)
  .startWith(false)

  const viewState = {
    isOpen$: isOpen$,
    listItemDOM$: li.DOM,
    contentDOM$: sources.contentDOM$ || $.just(div({},['no contentDOM$'])),
  }

  const DOM = combineLatestObj(viewState)
    .map(({isOpen, listItemDOM, contentDOM}) =>
      div({},[
        listItemDOM,
        isOpen && div('.collapsible',[contentDOM]),
      ].filter(i => !!i))
    )

  return {
    DOM,
  }
}
