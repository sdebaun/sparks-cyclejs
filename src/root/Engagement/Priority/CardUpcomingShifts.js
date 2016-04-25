import {Observable as $} from 'rx'
import {hideable} from 'util'

import {
  TitledCard,
} from 'components/sdm'

export const CardUpcomingShifts = sources => hideable(TitledCard)({...sources,
  title$: $.just('Ready to Work?'),
  content$: $.just([`
    You are on the team! Keep an eye on when you're scheduled to work,
    and we'll send you reminders.
  `]),
  isVisible$: sources.engagement$.map(e => e.isAssigned && e.isPaid),
})
