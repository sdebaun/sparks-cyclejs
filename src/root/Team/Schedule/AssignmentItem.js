import {Observable as $} from 'rx'

import {
  ProfileAvatar,
  ProfileFetcher,
} from 'components/profile'

import {
  ListItemClickable,
} from 'components/sdm'

export const AssignmentItem = sources => {
  const profileKey$ = sources.item$.pluck('profileKey')
  const pf = ProfileFetcher({...sources, profileKey$})
  const _sources = {...sources, profileKey$, profile$: pf.profile$}
  const title$ = $.combineLatest(
    _sources.profile$.pluck('fullName'),
    _sources.item$.pluck('$key'),
    (fullName, $key) => fullName || $key
  )

  return ListItemClickable({..._sources,
    leftDOM$: ProfileAvatar(_sources).DOM,
    title$,
  })
}
