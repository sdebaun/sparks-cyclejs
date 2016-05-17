import {Observable as $} from 'rx'
import {div, icon} from 'helpers'
import isolate from '@cycle/isolate'

import {
  ListItemCollapsible,
  ListItemCollapsibleDumb,
} from 'components/sdm'

const StepListItem = sources => {
  const isOpen$ = sources.isOpen$ || $.just(false)

  const leftDOM$ = isOpen$.map(isOpen =>
      div({},[
        isOpen ?
        icon('chevron-circle-right','accent') :
        icon('chevron-circle-right', 'disabled'),
      ])
    )

  return isolate(ListItemCollapsible)({...sources,
    classes$: $.just({'list-item-title': true}),
    leftDOM$,
    // contentDOM$: $.just(div('',['wat'])),
    isOpen$,
    // classes$: sources.isDone$.map(isDone => ({disabled: isDone})),
  })
}

const StepListItemDumb = sources => {
  const isOpen$ = sources.isOpen$ || $.just(false)

  const leftDOM$ = isOpen$.map(isOpen =>
      div({},[
        isOpen ?
        icon('chevron-circle-right','accent') :
        icon('chevron-circle-right', 'disabled'),
      ])
    )

  return isolate(ListItemCollapsibleDumb)({...sources,
    classes$: $.just({'list-item-title': true}),
    leftDOM$,
    // contentDOM$: $.just(div('',['wat'])),
    isOpen$,
    // classes$: sources.isDone$.map(isDone => ({disabled: isDone})),
  })
}

export {StepListItem, StepListItemDumb}
