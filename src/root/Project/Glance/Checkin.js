import {Observable as $} from 'rx'
import isolate from '@cycle/isolate'

import {div} from 'helpers'

import AssignmentsFetcher from './AssignmentsFetcher'

import {localTime} from 'util'
import moment from 'moment'

import {
  //ListItem,
  // ListItemNavigating,
  ListItemWithMenu,
  MenuItem,
  List,
  TitledCard,
} from 'components/sdm'

import {
  Assignments,
} from 'components/remote'

import {log} from 'util'

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
      .map(s => localTime(s.start).add(parseInt(s.hours,10),'hour').format('hh:mm a')), // eslint-disable-line max-len
    sources.item$.pluck('team').pluck('name'),
    (shiftStart,shiftEnd,teamName) => `${shiftStart} - ${shiftEnd} | ${teamName}` // eslint-disable-line max-len
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
      .map(s => localTime(s.start).add(parseInt(s.hours,10),'hour').format('hh:mm a')), // eslint-disable-line max-len
    sources.item$.pluck('team').pluck('name'),
    (shiftStart,shiftEnd,teamName) => `${shiftStart} - ${shiftEnd} | ${teamName}` // eslint-disable-line max-len
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
    rows$: sources.range({
      hoursAgo: 3,
      hoursAhead: 3,
    }),
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
    rows$: sources.ending({hoursAhead: 3}),
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
  const _sources = {...sources, ...AssignmentsFetcher(sources)}
  const cards = CardList(_sources)
  cards.queue$.subscribe(log('cards.queue$'))

  return {
    DOM: cards.DOM.map(d => div('.cardcontainer',[d])),
    queue$: cards.queue$,
    // route$: cards.route$,
  }
}
