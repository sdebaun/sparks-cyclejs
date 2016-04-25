import {Observable as $} from 'rx'

import {
  List,
  ListItemCollapsible,
} from 'components/sdm'

import {
  ProfileFetcher,
} from 'components/profile'

import {AssignmentItem} from './AssignmentItem'
import {AssignmentsFetcher} from 'components/assignment'

const AssignmentList = sources => List({...sources,
  Control$: $.of(AssignmentItem),
  rows$: sources.assignments$,
})

// const TeamList = sources => List({
//   Control$: $.of(Item),
//   rows$: sources.confirmed$,
// })

const _Fetch = sources => {
  const profileKey$ = sources.item$.pluck('profileKey')
  const {profile$} = ProfileFetcher({...sources, profileKey$})
  const {assignments$} = AssignmentsFetcher({...sources, profileKey$})
  // const {memberships$} = MembershipFetcher({...sources, profileKey$})

  return {
    profileKey$,
    profile$,
    assignments$,
  }
}

export const Item = sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const al = AssignmentList(_sources)

  return ListItemCollapsible({..._sources,
    title$: _sources.profile$.pluck('fullName'),
    iconSrc$: _sources.profile$.pluck('portraitUrl'),
    contentDOM$: al.DOM,
  })
}

