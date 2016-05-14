import {Observable as $} from 'rx'

import moment from 'moment'

import {
  List,
  ListItemCollapsible,
  ListItemNewTarget,
} from 'components/sdm'

import {
  ProfileFetcher,
} from 'components/profile'

import {
  Shifts,
} from 'components/remote'

import {AssignmentItem} from './AssignmentItem'
import {AssignmentsFetcher} from 'components/assignment'

import {cellC, icon} from 'helpers/layout'

import {log} from 'util'
import {combineDOMsToDiv} from 'util'

const AssignmentList = sources => List({...sources,
  Control$: $.of(AssignmentItem),
  rows$: sources.shifts$,
})

// const TeamList = sources => List({
//   Control$: $.of(Item),
//   rows$: sources.confirmed$,
// })

const _Fetch = sources => {
  const profileKey$ = sources.item$.pluck('profileKey')
  const {profile$} = ProfileFetcher({...sources, profileKey$})
  // const {assignments$} = AssignmentsFetcher({...sources, profileKey$})
  const assignments$ =
    AssignmentsFetcher({...sources, profileKey$}).assignments$

  const shifts$ = assignments$
    .map(arr => arr.map(a => Shifts.query.one(sources)(a.shiftKey)))
    .tap(log('shifts$ passed to query'))
    .shareReplay(1)
    .flatMapLatest(oarr => oarr.length > 0 ?
      $.combineLatest(...oarr) :
      $.of([])
    )
    .tap(log('shifts$ from assignments$'))
    .map(arr => arr.sort((a,b) => moment(a.start) - moment(b.start)))
    .shareReplay(1)
  // const {memberships$} = MembershipFetcher({...sources, profileKey$})

  return {
    profileKey$,
    profile$,
    shifts$,
    assignments$,
  }
}

const EngagementAssignmentCount = sources => ({
  DOM: sources.shifts$.map(s =>
    cellC({accent: s.length !== 2}, `${s.length}/2`, icon('insert_invitation'))
  ),
})

const ViewEngagement = sources => ListItemNewTarget({
  iconName$: $.just('link'),
  title$: $.just('See their Engagement Page'),
  url$: sources.item$.pluck('$key')
    .map(k => `/engaged/${k}`),
})

export const Item = sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const prev = ViewEngagement(_sources)
  const al = AssignmentList(_sources)
  const eac = EngagementAssignmentCount(_sources)

  const li = ListItemCollapsible({..._sources,
    title$: _sources.profile$.pluck('fullName'),
    iconSrc$: _sources.profile$.pluck('portraitUrl'),
    rightDOM$: eac.DOM,
    contentDOM$: combineDOMsToDiv('', prev, al),
  })

  return {
    DOM: li.DOM,
    queue$: al.queue$,
  }
}
