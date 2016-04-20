import {Observable as $} from 'rx'
import {div, icon} from 'helpers'

import {
  ListItemCollapsible,
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

  return ListItemCollapsible({...sources,
    leftDOM$,
    // contentDOM$: $.just(div('',['wat'])),
    isOpen$,
    // classes$: sources.isDone$.map(isDone => ({disabled: isDone})),
  })
}

export {StepListItem}
