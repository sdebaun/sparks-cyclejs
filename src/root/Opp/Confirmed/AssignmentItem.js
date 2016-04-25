import {Observable as $} from 'rx'

import {
  ProfileAvatar,
  ProfileFetcher,
} from 'components/profile'

import {
  ListItemWithMenu,
} from 'components/sdm'

import {
  ShiftContentExtra,
} from 'components/shift'

import {
  Shifts,
} from 'components/remote'

export const AssignmentItem = sources => {
  const shift$ = sources.item$.pluck('shiftKey')
    .flatMapLatest(Shifts.query.one(sources))

  return ListItemWithMenu({...sources,
    ...ShiftContentExtra({...sources, item$: shift$}),
  })
}
