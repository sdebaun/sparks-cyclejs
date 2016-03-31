import {Observable} from 'rx'
const {just, combineLatest} = Observable
// const {merge} = Observable

// import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {
  ListWithHeader,
  ListItem,
  ListItemClickable,
  // ListItemCollapsibleTextArea,
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

const OpenTeamListItem = sources => {
  const cb = CheckboxControl({...sources, value$: sources.membership$})

  const li = ListItemClickable({...sources,
    leftDOM$: TeamIcon(sources).DOM,
    title$: sources.team$.pluck('name'),
    rightDOM$: cb.DOM,
  })

  const queue$ = sources.membership$
    .sample(li.click$)
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
  }
}

// const RestrictedTeamListItem = sources => {
//   const cb = CheckboxControl({...sources, value$: sources.membership$})

//   const li = ListItemCollapsibleTextArea({...sources,
//     leftDOM$: TeamIcon(sources).DOM,
//     title$: sources.team$.pluck('name'),
//     rightDOM$: cb.DOM,
//     value$: sources.membership$.map(m => m && m.answer || ''),
//   })

//   const queue$ = li.value$
//     .combineLatest(
//       sources.membership$,
//       sources.teamKey$,
//       sources.oppKey$,
//       sources.engagementKey$,
//       (answer, membership, teamKey, oppKey, engagementKey) =>
//         membership ?
//         Memberships.action.remove(membership.$key) :
//         Memberships.action.create({teamKey, oppKey, engagementKey, answer}),
//     ).share()

//   queue$.subscribe(log('R.queue$'))

//   return {
//     DOM: li.DOM,
//     queue$,
//   }
// }

const FulfillerMemberListItem = sources => {
  const teamKey$ = sources.item$.pluck('teamKey')
  const team$ = teamKey$
    .flatMapLatest(Teams.query.one(sources))
  const membership$ = TeamMemberLookup({...sources, teamKey$}).found$

  const childSources = {...sources, teamKey$, team$, membership$}

  // works with OpenTeamListItem, but not RestrictedTeamListItem
  // const control = RestrictedTeamListItem(childSources)
  const control = OpenTeamListItem(childSources)

  // this is what it should do
  // const control$ = team$
  //   .map(({isPublic}) =>
  //     (isPublic ? OpenTeamListItem : RestrictedTeamListItem)(childSources)
  //   )

  const queue$ = control.queue$
  const DOM = control.DOM

  // const queue$ = control$.flatMapLatest(c => c.queue$)
  // const DOM = control$.flatMapLatest(c => c.DOM)

  queue$.subscribe(log('LI.queue$'))

  return {
    DOM,
    queue$,
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

  return ListWithHeader({...sources,
    headerDOM: header.DOM,
    Control$: just(FulfillerMemberListItem),
    // this doesnt work in the same way it doesnt work
    // when routed via FulfillerMemberListItem
    // Control$: just(RestrictedTeamListItem),
    // membership$: just({$key: 1234}),
    // team$: just({name: 'foo', $key: 'bar'}),
    // teamKey$: just(1234),
  })
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
