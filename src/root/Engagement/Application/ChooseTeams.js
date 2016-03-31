import {Observable} from 'rx'
const {just, empty, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  List,
  ListItem,
  ListItemClickable,
  ListItemCollapsibleTextArea,
  ListItemHeader,
  ListItemTextArea,
  CheckboxControl,
  OkAndCancel,
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

const OpenTeamListItem = sources => {
  const cb = CheckboxControl({...sources, value$: sources.membership$})

  // const li = ListItemClickable({...sources,
  //   leftDOM$: TeamIcon(sources).DOM,
  //   title$: sources.team$.pluck('name'),
  //   rightDOM$: cb.DOM,
  // })
  const li = ListItemCollapsibleTextArea({...sources,
    leftDOM$: TeamIcon(sources).DOM,
    title$: sources.team$.pluck('name'),
    rightDOM$: cb.DOM,
    value$: sources.membership$.map(m => m && m.answer || ''),
  })

  const queue$ = sources.membership$
    .sample(li.ok$)
    // .sample(li.click$)
    .combineLatest(
      sources.teamKey$,
      sources.oppKey$,
      sources.engagementKey$,
      (membership, teamKey, oppKey, engagementKey) =>
        membership ?
        Memberships.action.remove(membership.$key) :
        Memberships.action.create({teamKey, oppKey, engagementKey}),
    )

  queue$.subscribe(log('O.queue$'))

  return {
    DOM: li.DOM,
    queue$,
    id: 'O',
  }
}

const RestrictedTeamListItem = sources => {
  const cb = CheckboxControl({...sources, value$: sources.membership$})

  const li = ListItemCollapsibleTextArea({...sources,
    leftDOM$: TeamIcon(sources).DOM,
    title$: sources.team$.pluck('name'),
    rightDOM$: cb.DOM,
    value$: sources.membership$.map(m => m && m.answer || ''),
  })

  const queue$ = li.value$
    .combineLatest(
      sources.membership$,
      sources.teamKey$,
      sources.oppKey$,
      sources.engagementKey$,
      (answer, membership, teamKey, oppKey, engagementKey) =>
        membership ?
        Memberships.action.remove(membership.$key) :
        Memberships.action.create({teamKey, oppKey, engagementKey, answer}),
    )

  queue$.subscribe(log('R.queue$'))

  return {
    DOM: li.DOM,
    queue$,
    id: 'R',
  }
}

const FulfillerMemberListItem = sources => {
  const teamKey$ = sources.item$.pluck('teamKey')
  const team$ = teamKey$
    .flatMapLatest(Teams.query.one(sources))
  const membership$ = TeamMemberLookup({...sources, teamKey$}).found$
  // sources.memberships$.subscribe(log('memberships$'))
  // membership$.subscribe(log('membershipKey$'))

  // const cb = CheckboxControl({...sources, value$: membership$})

  // const liRestricted = ListItemCollapsibleTextArea({...sources,
  //   leftDOM$: TeamIcon({...sources, teamKey$}).DOM,
  //   title$: team$.pluck('name'),
  //   rightDOM$: cb.DOM,
  //   value$: membership$.map(m => m && m.answer || ''),
  // })

  // const liOpen = ListItemClickable({...sources,
  //   leftDOM$: TeamIcon({...sources, teamKey$}).DOM,
  //   title$: team$.pluck('name'),
  //   rightDOM$: cb.DOM,
  // })
  const childSources = {...sources, teamKey$, team$, membership$}

  const control = OpenTeamListItem(childSources)

  // const control$ = team$
  //   .map(({isPublic}) =>
  //     // (isPublic ? OpenTeamListItem : RestrictedTeamListItem)(childSources)
  //     (!isPublic ? RestrictedTeamListItem : OpenTeamListItem)(childSources)
  //   )

  // control$.subscribe(log('control$'))

  // const switchOpen$ = membership$
  //   .sample(liOpen.click$)
  //   .combineLatest(
  //     teamKey$,
  //     sources.oppKey$,
  //     sources.engagementKey$,
  //     (membership, teamKey, oppKey, engagementKey) =>
  //       membership ?
  //       Memberships.action.remove(membership.$key) :
  //       Memberships.action.create({teamKey, oppKey, engagementKey}),
  //   )
  // switchOpen$.subscribe(log('switchOpen$'))

  // const switchRestricted$ = membership$
  //   .sample(liRestricted.value$)
  //   .combineLatest(
  //     teamKey$,
  //     sources.oppKey$,
  //     sources.engagementKey$,
  //     liRestricted.value$,
  //     (membership, teamKey, oppKey, engagementKey, answer) =>
  //       membership ?
  //       Memberships.action.remove(membership.$key) :
  //       Memberships.action.create({teamKey, oppKey, engagementKey, answer}),
  //   )
  // switchRestricted$.subscribe(log('switchRestricted$'))

  // const queue$ = control$.flatMapLatest(ctrl =>
  //   membership$
  //   .sample(ctrl.value$ || ctrl.click$)
  //   .combineLatest(
  //     teamKey$,
  //     sources.oppKey$,
  //     sources.engagementKey$,
  //     liRestricted.value$,
  //     (membership, teamKey, oppKey, engagementKey, answer) =>
  //       membership ?
  //       Memberships.action.remove(membership.$key) :
  //       Memberships.action.create({teamKey, oppKey, engagementKey, answer}),
  //   )
  // )

  // const queue$ = control$.flatMapLatest(c => c.queue$)
  // const DOM = control$.flatMapLatest(c => c.DOM)

  const queue$ = control.queue$
  const DOM = control.DOM

  queue$.subscribe(log('LI.queue$'))

  return {
    DOM,
    queue$,
    // queue$: empty(),
  }
}

const TeamsMembersList = sources => {
  const header = ListItemHeader({...sources,
    title$: just('Available Teams'),
    rightDOM$: combineLatest(
      sources.memberships$.map(m => m.length),
      sources.rows$.map(r => r.length),
      (m,t) => m + '/' + t
    ),
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
