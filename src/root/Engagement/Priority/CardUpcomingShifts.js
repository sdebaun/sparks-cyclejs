import {Observable as $} from 'rx'
import {hideable} from 'util'

import {
  TitledCard,
} from 'components/sdm'

export const CardUpcomingShifts = sources => {
  const content$ = sources.shifts$
    .map(shifts => [`
      You've got ${shifts.length} shifts coming up.
      Are you ready to make a difference?
    `])

  return hideable(TitledCard)({...sources,
    title$: $.just('Ready to Work?'),
    content$,
    // content$: $.just([`
    //   You've got some shifts coming up. Are you ready to make a difference?
    // `]),
    isVisible$: sources.engagement$.map(e => e.isAssigned && e.isPaid),
  })
}

