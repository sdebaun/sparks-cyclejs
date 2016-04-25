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
  sources.item$.tap(x => console.log('AssignmentItem.item$', x))
  return ListItemWithMenu({...sources,
    ...ShiftContentExtra(sources),
  })
}
