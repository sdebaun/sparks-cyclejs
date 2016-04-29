import {Observable as $} from 'rx'

import {div} from 'helpers'

import {localTime} from 'util'
import moment from 'moment'

import {
  ListItem,
  List,
  TitledCard,
} from 'components/sdm'

import {
  Assignments,
  Shifts,
  Profiles,
} from 'components/remote'

import {log} from 'util'

const _Fetch = sources => {
  const assignmentsByOpp$ = sources.opps$
    .map(opps => opps.map(o => Assignments.query.byOpp(sources)(o.$key)))
    .flatMapLatest(arrayAssignQueries => $.combineLatest(arrayAssignQueries))

  assignmentsByOpp$.subscribe(log('assignmentsByOpp$'))

  const assignmentsOnly$ = assignmentsByOpp$
    .map(assignments => [].concat.apply([],assignments))

  assignmentsOnly$.subscribe(log('assignmentsOnly$'))

  const assignments$ = assignmentsOnly$
    .map(amnts => amnts.filter(a => a.profileKey && a.shiftKey).map(amnt =>
      $.combineLatest(
        Shifts.query.one(sources)(amnt.shiftKey),
        Profiles.query.one(sources)(amnt.profileKey),
        (shift, profile) => ({...amnt, shift, profile})
      )
    ))
    .flatMapLatest(amntQueries => $.combineLatest(amntQueries))

  assignments$.subscribe(log('assignments$'))

  const assignmentsStarting$ = assignments$
    .map(amnts =>
      amnts.filter(a =>
        !a.startTime && localTime(a.shift.start) < localTime(moment())
      )
    )

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

const CheckinItem = sources => ListItem({...sources,
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
