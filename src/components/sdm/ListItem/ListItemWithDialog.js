import {Observable as $} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {ListItemClickable} from './ListItemClickable'

import {div} from 'cycle-snabbdom'

import {Dialog} from 'components/sdm'

export const ListItemWithDialog = sources => {
  const _listItem = ListItemClickable(sources)

  const iconName$ = sources.iconUrl$ ||
    sources.dialogIconName$ ||
    sources.iconName$

  const dialog = Dialog({...sources,
    isOpen$: _listItem.click$.map(true).merge(sources.isOpen$ || $.never()),
    titleDOM$: sources.dialogTitleDOM$,
    iconName$,
    contentDOM$: sources.dialogContentDOM$,
  })

  const DOM = combineLatestObj({
    listItemDOM$: _listItem.DOM,
    dialogDOM$: dialog.DOM,
  }).map(({
    listItemDOM,
    dialogDOM,
  }) =>
    div({},[listItemDOM, dialogDOM])
  )

  return {
    DOM,
    value$: dialog.value$,
    submit$: dialog.submit$,
    close$: dialog.close$,
  }
}

