import {Observable as $} from 'rx'
import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {localTime} from 'util'
import moment from 'moment'

import {
  ListItem,
  // ListItemNavigating,
  ListItemWithMenu,
  MenuItem,
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

  const assignmentsEnding$ = assignments$
    .map(amnts =>
      amnts.filter(a =>
        a.startTime && !a.endTime && localTime(a.shift.start) < localTime(moment())
      )
    )
    .shareReplay(1)

  assignmentsStarting$.subscribe(log('assignmentsStarting$'))

  return {
    assignments$,
    assignmentsStarting$,
    assignmentsEnding$,
  }
}

const _Checkout = sources => MenuItem({...sources,
  iconName$: $.of('sign-out'),
  title$: $.of('Checkout Now!'),
})

const CheckoutItem = sources => {
  const profile$ = sources.item$
    .pluck('profile')

  const ci = isolate(_Checkout)(sources)

  const subtitle$ = $.combineLatest(
    sources.item$.pluck('shift')
      .map(s => localTime(s.start).format('ddd D MMM hh:mm a')),
    sources.item$.pluck('shift')
      .map(s => localTime(s.start).add(parseInt(s.hours,10),'hour').format('hh:mm a')),
    sources.item$.pluck('team').pluck('name'),
    (shiftStart,shiftEnd,teamName) => `${shiftStart} - ${shiftEnd} | ${teamName}`
  )

  const queue$ = ci.click$
    .withLatestFrom(
      sources.item$.pluck('$key'),
      (c, key) => ({key, values: {endTime: localTime(moment()).format()}})
    )
    .tap(log('queue$'))
    .map(Assignments.action.update)
    .tap(log('queue$:Assignments.update'))

  const li = ListItemWithMenu({...sources,
    title$: profile$.pluck('fullName'),
    subtitle$,
    iconSrc$: profile$.pluck('portraitUrl'),
    menuItems$: $.just([ci.DOM]),
  })

  return {
    ...li,
    queue$,
  }
}

const _Checkin = sources => MenuItem({...sources,
  iconName$: $.of('sign-in'),
  title$: $.of('Checkin Now!'),
})

const CheckinItem = sources => {
  const profile$ = sources.item$
    .pluck('profile')

  const ci = isolate(_Checkin)(sources)

  const subtitle$ = $.combineLatest(
    sources.item$.pluck('shift')
      .map(s => localTime(s.start).format('ddd D MMM hh:mm a')),
    sources.item$.pluck('shift')
      .map(s => localTime(s.start).add(parseInt(s.hours,10),'hour').format('hh:mm a')),
    sources.item$.pluck('team').pluck('name'),
    (shiftStart,shiftEnd,teamName) => `${shiftStart} - ${shiftEnd} | ${teamName}`
  )

  const queue$ = ci.click$
    .withLatestFrom(
      sources.item$.pluck('$key'),
      (c, key) => ({key, values: {startTime: localTime(moment()).format()}})
    )
    .tap(log('queue$'))
    .map(Assignments.action.update)
    .tap(log('queue$:Assignments.update'))

  const li = ListItemWithMenu({...sources,
    title$: profile$.pluck('fullName'),
    subtitle$,
    iconSrc$: profile$.pluck('portraitUrl'),
    menuItems$: $.just([ci.DOM]),
  })

  return {
    ...li,
    queue$,
  }
}

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

  const card = TitledCard({...sources,
    elevation$: $.just(2),
    content$: $.just([list.DOM]),
    title$: $.just('Check them IN'),
  })

  return {
    ...card,
    queue$: list.queue$,
  }
}

const CheckoutCard = sources => {
  const list = List({...sources,
    Control$: $.just(CheckoutItem),
    rows$: sources.assignmentsEnding$,
    // rows$: $.just([1,2,3]),
  })

  const card = TitledCard({...sources,
    elevation$: $.just(2),
    content$: $.just([list.DOM]),
    title$: $.just('Check them OUT'),
  })

  return {
    ...card,
    queue$: list.queue$,
  }
}

const CardList = sources => {
  const cin = CheckinCard(sources)
  const cout = CheckoutCard(sources)

  return {
    ...CombinedList({...sources,
      contents$: $.combineLatest(cin.DOM, cout.DOM),
    }),
    queue$: $.merge(cin.queue$,cout.queue$),
    // route$: $.merge(managed.route$, engaged.route$, conf.route$),
  }
}

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}
  const cards = CardList(_sources)
  cards.queue$.subscribe(log('cards.queue$'))

  return {
    DOM: cards.DOM.map(d => div('.cardcontainer',[d])),
    queue$: cards.queue$,
    // route$: cards.route$,
  }
}
