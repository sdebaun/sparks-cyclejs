import {Observable} from 'rx'
const {just, combineLatest} = Observable

// import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  List,
  ListItem,
  ListItemClickable,
  ListItemHeader,
  CheckboxControl,
} from 'components/sdm'

import {
  Memberships,
  Fulfillers,
  Teams,
} from 'components/remote'

import {TeamIcon} from 'components/team'

import {log} from 'util'

const Instruct = sources => ListItem({...sources,
  title$: just('Choose one or more Teams that you want to join.'),
})

const TeamMemberLookup = sources => ({
  found$: sources.memberships$.combineLatest(
    sources.teamKey$,
    (memberships, findTeamKey) =>
      memberships.find(({teamKey}) => findTeamKey === teamKey)
  ),
})

const FulfillerMemberListItem = sources => {
  const teamKey$ = sources.item$.pluck('teamKey')
  const team$ = teamKey$
    .flatMapLatest(Teams.query.one(sources))

  sources.memberships$.subscribe(log('memberships$'))
  const membership$ = TeamMemberLookup({...sources, teamKey$}).found$
  membership$.subscribe(log('membershipKey$'))

  const cb = CheckboxControl({...sources, value$: membership$})

  const li = ListItemClickable({...sources,
    leftDOM$: TeamIcon({...sources, teamKey$}).DOM,
    title$: team$.pluck('name'),
    rightDOM$: cb.DOM,
  })

  const queue$ = membership$
    .sample(li.click$)
    .combineLatest(
      teamKey$,
      sources.oppKey$,
      sources.engagementKey$,
      (membership, teamKey, oppKey, engagementKey) =>
        membership ?
        Memberships.action.remove(membership.$key) :
        Memberships.action.create({teamKey, oppKey, engagementKey}),
    )

  return {
    DOM: li.DOM,
    queue$,
  }
}

const TeamsMembersList = sources => {
  const header = ListItemHeader({...sources,
    title$: just('Available Teams'),
    rightDOM$: just('x'),
  })

  const list = List({...sources,
    Control$: just(FulfillerMemberListItem),
  })

  const DOM = sources.rows$.combineLatest(
    header.DOM,
    list.DOM,
    (rows, ...restDOM) =>
      div({}, rows.length > 0 ? restDOM : []),
  )

  return {
    DOM,
    queue$: list.queue$,
  }
}

export default sources => {
  const oppKey$ = sources.engagement$.pluck('oppKey')

  const memberships$ = sources.engagementKey$
    .flatMapLatest(Memberships.query.byEngagement(sources))

  const fulfillers$ = oppKey$
    .flatMapLatest(Fulfillers.query.byOpp(sources))

  const ictrl = Instruct(sources)

  const list = TeamsMembersList({...sources,
    oppKey$,
    rows$: fulfillers$,
    memberships$,
  })

  const items = [
    ictrl,
    list,
  ]

  const DOM = combineLatest(
    ...items.map(i => i.DOM),
    (...doms) => div({},doms)
  )

  return {
    DOM,
    queue$: list.queue$,
    // route$,
  }
}
