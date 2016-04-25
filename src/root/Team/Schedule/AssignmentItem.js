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

  return ListItemClickable({..._sources,
    leftDOM$: ProfileAvatar(_sources).DOM,
    title$: _sources.profile$.pluck('fullName'),
  })
}
