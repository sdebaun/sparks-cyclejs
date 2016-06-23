import {Observable as $} from 'rx'
import isolate from '@cycle/isolate'
import {propTo} from 'util'

import {
  ListItemWithMenu,
  MenuItem,
} from 'components/sdm'

import {
  ShiftContentExtra,
} from 'components/shift'

import {
  Assignments,
} from 'components/remote'

const _Remove = sources => MenuItem({...sources,
  iconName$: $.of('remove'),
  title$: $.of('Remove'),
})

export const AssignmentItem = sources => {
  const rem = isolate(_Remove)(sources)

  const matchingAssignment$ = $.combineLatest(
    sources.assignments$,
    sources.item$,
    (assignments, shift) => assignments.find(i => i.shiftKey === shift.$key)
  )

  const queue$ = rem.click$
    .withLatestFrom(matchingAssignment$, (c, a) => a)
    .map(propTo('$key', 'key'))
    .map(Assignments.action.remove)

  const li = ListItemWithMenu({...sources,
    ...ShiftContentExtra(sources),
    menuItems$: $.of([rem.DOM]),
  })

  return {
    DOM: li.DOM,
    queue$,
  }
}
