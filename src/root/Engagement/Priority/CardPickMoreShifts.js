import {Observable as $} from 'rx'
import {hideable} from 'util'
import {icon} from 'helpers'

import {
  ListItemNavigating,
  TitledCard,
} from 'components/sdm'

const _Info = sources => ListItemNavigating({...sources,
  title$: $.combineLatest(
    sources.shifts$,
    sources.commitmentShifts$,
    sources.shiftsNeeded$,
    (shifts, shiftsReq, shiftsNeeded) =>
      shiftsNeeded > 0 ?
        `
        You need ${shiftsReq} shifts
        but you have only picked ${shifts.length}.
        Pick your shifts so you can fulfill your commitment!
        ` :
        `You've got enough shifts, just confirm your spot.`
  ),
  leftDOM$: $.just(icon('chevron-circle-right', 'accent')),
  path$: $.just('/confirmation'),
})

export const CardPickMoreShifts = _sources => {
  const shiftsNeeded$ = $.combineLatest(
    _sources.shifts$,
    _sources.commitmentShifts$,
    (shifts, shiftsReq) => shiftsReq - shifts.length
  )

  const sources = {..._sources, shiftsNeeded$}

  const info = _Info(sources)

  const isVisible$ = sources.engagement$
    .map(({isAssigned, isPaid, isConfirmed}) =>
      !isAssigned && isPaid && isConfirmed
    )

  const content$ = $.of([
    info.DOM,
  ])

  const card = hideable(TitledCard)({...sources,
    title$: sources.shiftsNeeded$.map(needed =>
      needed > 0 ? `Pick ${needed} more shifts!` : `Lock in Your Shifts`
    ),
    content$,
    isVisible$,
  })

  return {
    DOM: card.DOM,
    route$: info.route$,
  }
}

