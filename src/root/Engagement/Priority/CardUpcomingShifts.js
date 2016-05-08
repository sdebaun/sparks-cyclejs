import {Observable as $} from 'rx'
import {hideable} from 'util'
import {div, a} from 'cycle-snabbdom'

import {
  List,
  ListItem,
  TitledCard,
} from 'components/sdm'

import {
  ShiftContentExtra,
} from 'components/shift'

import {
  DescriptionListItem,
} from 'components/ui'

const _Info = sources => ListItem({...sources,
  title$: sources.shifts$
    .map(shifts => `
      You've got ${shifts.length} shifts coming up.
      Are you ready to make a difference?
    `),
})

const _Reschedule = sources => DescriptionListItem({...sources,
  title$: $.of(
    div([
      'Your schedule is locked.  To request an unlock, email ',
      a({attrs: {href: 'mailto:help@sparks.network'}},'help@sparks.network'),
      '.',
    ])
  ),
})

const _Item = sources => ListItem({...sources,
  ...ShiftContentExtra(sources),
})

const _List = sources => List({...sources,
  Control$: $.of(_Item),
  rows$: sources.shifts$,
})

export const CardUpcomingShifts = sources => {
  const info = _Info(sources)
  const list = _List(sources)
  const rs = _Reschedule(sources)

  const isVisible$ = $.combineLatest(
    sources.engagement$,
    sources.commitmentShifts$,
    sources.shifts$,
    ({isAssigned, isPaid, isConfirmed}, shiftsReq, shifts) =>
      isAssigned && isPaid && isConfirmed && shifts.length === shiftsReq
  )

  const content$ = $.of([
    info.DOM,
    list.DOM,
    rs.DOM,
  ])

  return hideable(TitledCard)({...sources,
    title$: $.just('Ready to Work?'),
    content$,
    isVisible$,
  })
}

