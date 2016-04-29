import {Observable as $} from 'rx'

import {div} from 'helpers'

import {localTime} from 'util'
import moment from 'moment'

import {
  ListItem,
  ListItemNavigating,
  List,
  TitledCard,
} from 'components/sdm'

import {
  Assignments,
  Shifts,
  Profiles,
  Engagements,
  Teams,
} from 'components/remote'

import {log} from 'util'

const _Fetch = sources => {
  const assignmentsByOpp$ = sources.opps$
    .map(opps => opps.map(o => Assignments.query.byOpp(sources)(o.$key)))
    .flatMapLatest(arrayAssignQueries => $.combineLatest(arrayAssignQueries))
    .shareReplay(1)

  assignmentsByOpp$.subscribe(log('assignmentsByOpp$'))

  const assignmentsOnly$ = assignmentsByOpp$
    .map(assignments => [].concat.apply([],assignments))
    .shareReplay(1)

  assignmentsOnly$.subscribe(log('assignmentsOnly$'))

  const assignments$ = assignmentsOnly$
    .map(amnts => amnts.filter(a => a.profileKey && a.shiftKey).map(amnt =>
      $.combineLatest(
        Shifts.query.one(sources)(amnt.shiftKey),
        Profiles.query.one(sources)(amnt.profileKey),
        Engagements.query.one(sources)(amnt.engagementKey),
        Teams.query.one(sources)(amnt.teamKey),
        (shift, profile, engagement, team) => ({...amnt, shift, profile, engagement, team})
      )
    ))
    .flatMapLatest(amntQueries => $.combineLatest(amntQueries))
    .map(amnts => amnts.sort((a,b) => moment(a.shift.start) - moment(b.shift.start)))
    .shareReplay(1)

  assignments$.subscribe(log('assignments$'))

  const assignmentsStarting$ = assignments$
    .map(amnts =>
      amnts.filter(a =>
        !a.startTime && localTime(a.shift.start) < localTime(moment())
      )
    )
    .shareReplay(1)

  assignmentsStarting$.subscribe(log('assignmentsStarting$'))

  return {
    assignments$,
    assignmentsStarting$,
  }
}

// export default _sources => {
//   const sources = {..._sources, ..._Fetch(_sources)}

//   return {
//     DOM: $.just(div('',['wat'])),
//   }
// }
const CheckinItem = sources => {
  const profile$ = sources.item$
    .pluck('profile')

  const subtitle$ = $.combineLatest(
    sources.item$.pluck('shift')
      .map(s => localTime(s.start).format('hh:mm a')),
    sources.item$.pluck('team').pluck('name'),
    (shiftStart,teamName) => `${shiftStart} | ${teamName}`
  )

  return ListItem({...sources,
    title$: profile$.pluck('fullName'),
    subtitle$,
    iconSrc$: profile$.pluck('portraitUrl'),
    // path$: sources.item$.map(({$key}) =>
      // sources.router.createHref(`/show/${$key}`)
  })
}


const xCheckinItem = sources => ListItem({...sources,
  title$: sources.item$.pluck('$key'),
})

const CombinedList = sources => ({
  DOM: sources.contents$
    .tap(x => console.log('contents$', x))
    .map(contents => div('',contents)),
})

const CheckinCard = sources => {
  const list = List({...sources,
    Control$: $.just(CheckinItem),
    rows$: sources.assignmentsStarting$,
    // rows$: $.just([1,2,3]),
  })

  return TitledCard({...sources,
    elevation$: $.just(2),
    // isVisible$: $.combineLatest(
    //   sources.user.projectsOwned$, sources.engagements$,
    //   (p,e) => p.length === 0 && e.length === 0
    // ),
    content$: $.just([list.DOM]),
    title$: $.just('Welcome to the Sparks.Network!'),
  })
}

const CardList = sources => {
  const cin = CheckinCard(sources)

  // const contents$ = $.combineLatest(
  //   cin.DOM,
  //   // conf.DOM,
  //   // managed.contents$,
  //   // engaged.contents$,
  //   (w, c, m, e) => [w, c, ...m, ...e]
  // )

  return {
    ...CombinedList({...sources,
      contents$: $.combineLatest(cin.DOM),
    }),
    // route$: $.merge(managed.route$, engaged.route$, conf.route$),
  }
}

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}
  const cards = CardList(_sources)

  return {
    DOM: cards.DOM.map(d => div('.cardcontainer',[d])),
    // route$: cards.route$,
  }
}
