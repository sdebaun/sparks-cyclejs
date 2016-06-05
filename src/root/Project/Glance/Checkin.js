import {Observable as $} from 'rx'
import isolate from '@cycle/isolate'

import {div} from 'helpers'

import AssignmentsFetcher from './AssignmentsFetcher'

import {localTime} from 'util'
import moment from 'moment'

import {
  ListItemWithMenu,
  MenuItem,
  List,
  TitledCard,
} from 'components/sdm'

import {
  Assignments,
} from 'components/remote'

import {log} from 'util'

const endOfShift = shift =>
  localTime(shift.start).add(parseInt(shift.hours, 10), 'hour')

const CheckoutItem = sources => {
  const profile$ = sources.item$
    .pluck('profile')

  const checkoutNow = isolate(MenuItem)({
    ...sources,
    iconName$: $.of('sign-out'),
    title$: $.of('Checkout Now!'),
  })
  const checkoutLate = isolate(MenuItem)({
    ...sources,
    iconName$: $.of('sign-out'),
    title$: $.of('Checkout at shift'),
  })

  const subtitle$ = $.combineLatest(
    sources.item$.pluck('shift')
      .map(s => localTime(s.start).format('ddd D MMM hh:mm a')),
    sources.item$.pluck('shift')
      .map(s => endOfShift(s).format('hh:mm a')),
    sources.item$.pluck('team').pluck('name'),
    (shiftStart, shiftEnd, teamName) =>
      `${shiftStart} - ${shiftEnd} | ${teamName}`
  )

  const queue$ = sources.item$.map(item => $.merge(
      checkoutNow.click$.map({item, endTime: localTime(moment())}),
      checkoutLate.click$.map({item, endTime: endOfShift(item.shift)})))
    .mergeAll()
    .map(({item, endTime}) =>
      ({key: item.$key, values: {endTime: endTime.format()}}))
    .map(Assignments.action.update)

  const li = ListItemWithMenu({...sources,
    title$: profile$.pluck('fullName'),
    subtitle$,
    iconSrc$: profile$.pluck('portraitUrl'),
    menuItems$: $.just([
      checkoutNow.DOM,
      checkoutLate.DOM,
    ]),
  })

  return {
    ...li,
    queue$,
  }
}

const CheckinItem = sources => {
  const profile$ = sources.item$
    .pluck('profile')

  const ci = isolate(MenuItem)({
    ...sources,
    iconName$: $.of('sign-in'),
  })

  const subtitle$ = $.combineLatest(
    sources.item$.pluck('shift')
      .map(s => localTime(s.start).format('ddd D MMM hh:mm a')),
    sources.item$.pluck('shift')
      .map(s => endOfShift(s).format('hh:mm a')),
    sources.item$.pluck('team').pluck('name'),
    (shiftStart, shiftEnd, teamName) =>
      `${shiftStart} - ${shiftEnd} | ${teamName}`
  )

  const queue$ = ci.click$
    .withLatestFrom(
      sources.item$,
      (c, item) => ({
        key: item.$key,
        values: {startTime: localTime(sources.time(item)).format()},
      })
    )
    .map(Assignments.action.update)

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
  const list = List({
    ...sources,
    title$: $.of('Checkin NOW'),
    time: () => moment(),
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

const LateCheckinCard = sources => {
  const list = List({
    ...sources,
    title$: $.of('Check in at shift time'),
    time: item => item.shift.start,
    Control$: $.just(CheckinItem),
    rows$: sources.late(),
  })

  const card = TitledCard({
    ...sources,
    elevation$: $.just(2),
    content$: $.just([list.DOM]),
    title$: $.just('Late Check In'),
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
  const lin = LateCheckinCard(sources)
  const cout = CheckoutCard(sources)

  return {
    ...CombinedList({...sources,
      contents$: $.combineLatest(cin.DOM, cout.DOM, lin.DOM),
    }),
    queue$: $.merge(cin.queue$, lin.queue$, cout.queue$),
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
