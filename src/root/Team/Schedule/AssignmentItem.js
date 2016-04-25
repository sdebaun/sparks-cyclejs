import {Observable as $} from 'rx'

import {
  ProfileAvatar,
  ProfileFetcher,
} from 'components/profile'

import {
  ListItemWithMenu,
  MenuItem,
} from 'components/sdm'

import {
  Assignments,
} from 'components/remote'

const _Remove = sources => MenuItem({...sources,
  iconName$: $.of('remove'),
  title$: $.of('Remove'),
})

export const AssignmentItem = sources => {
  const profileKey$ = sources.item$.pluck('profileKey')
  const pf = ProfileFetcher({...sources, profileKey$})
  const _sources = {...sources, profileKey$, profile$: pf.profile$}
  const title$ = $.combineLatest(
    _sources.profile$.pluck('fullName'),
    _sources.item$.pluck('$key'),
    (fullName, $key) => fullName || $key
  )

  const rem = _Remove(_sources)

  const li = ListItemWithMenu({..._sources,
    leftDOM$: ProfileAvatar(_sources).DOM,
    menuItems$: $.of([rem.DOM]),
    title$,
  })

  const queue$ = rem.click$
    .flatMapLatest(_sources.item$)
    .pluck('$key')
    .map(Assignments.action.remove)

  return {
    DOM: li.DOM,
    queue$,
  }
}
