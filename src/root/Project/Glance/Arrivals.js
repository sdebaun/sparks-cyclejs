import {Observable as $} from 'rx'
import isolate from '@cycle/isolate'
import {complement, isEmpty, filter, any, split, toLower, compose,
        map, prop, props, allPass, join, useWith,
        propEq, head, always, ifElse} from 'ramda'

import {div, img, span} from 'cycle-snabbdom'
import {combineDOMsToDiv, formatTime} from 'util'

import {iconSrc} from 'helpers'

import {
  List,
  ListItem,
  ListItemClickable,
  InputControl,
  LargeCard,
  TitledCard,
} from 'components/sdm'

import {
  ShiftContentExtra,
} from 'components/shift'

import {
  Arrivals,
} from 'components/remote'

import AssignmentsFetcher from './AssignmentsFetcher'

require('./arrivals.scss')

const SearchBox = sources => {
  const focus$ = sources.DOM.select('.arrivals-search').observable
    .distinctUntilChanged()
    .filter(complement(isEmpty))
    .map({selector: '.arrivals-search input'})

  const input = isolate(InputControl)({
    label$: $.of('Search'),
    ...sources,
  })

  const vtree$ = input.DOM.map(i =>
    div('.arrivals-search', {
      key: 'arrivals-search',
    }, [i]))

  return {
    ...input,
    DOM: vtree$,
    focus$,
    term$: input.value$,
  }
}

const ProfileView = sources => {
  const profile$ = sources.profile$

  const enterPressed$ = profile$
    .map(() =>
      sources.key$.filter(propEq('keyCode', 13))
      .map(true)
      .startWith(false))
    .switch()
    .shareReplay(1)

  const assignments$ = sources.fetchAllChildren(
    profile$.map(prop('assignments')))

  const shiftItems$ = assignments$.map(map(prop('shift')))
    .map(map(shift =>
        ListItem({
          ...ShiftContentExtra({
            ...sources,
            item$: $.just(shift),
          }),
        })))
    .map(map(prop('DOM')))
    .flatMapLatest($.combineLatest)

  const content$ = $.combineLatest(profile$, shiftItems$, enterPressed$,
    (profile, shiftItems, enterPressed) => [
      div('.col-xs-4.arrival-portrait.big', {
        class: {arrived: profile.arrival || enterPressed},
        style: {position: 'relative'},
      }, [
        img({attrs: {src: profile.portraitUrl},
          style: {width: '100%', display: 'block', borderRadius: '50%'}}),
        div('.iconcontainer', [
          span('.spinner.icon-spinner9', {
            style: {
              display: !profile.arrival && enterPressed ? 'block' : 'none',
            },
          })]),
        div('.iconcontainer', [
          span('.icon-check', {
            style: {
              display: profile.arrival ? 'block' : 'none',
            },
          })]),
      ]),
      div('.col-xs-8', [
        div('.row', [div(profile.email)]),
        div('', shiftItems),
        div('.row', [div(
          profile.arrival ?
            `Arrived at ${formatTime(profile.arrival.arrivedAt)}` :
            'Press return to mark as arrived'
        )]),
      ])]
  ).shareReplay(1)

  const card = TitledCard({
    ...sources,
    content$,
    title$: profile$.pluck('fullName'),
    cardComponent: LargeCard,
  })

  const queue$ = $.combineLatest(
    sources.projectKey$, profile$,
    (projectKey, profile) =>
      Arrivals.action.create({
        projectKey,
        profileKey: profile.$key,
      }))
    .sample(enterPressed$.filter(Boolean))

  return {
    DOM: card.DOM,
    queue$,
  }
}

const ProfileListItem = sources => {
  const profile$ = sources.item$

  const icon$ = profile$.map(profile =>
    div('.arrival-portrait', {class: {arrived: profile.arrival}}, [
      iconSrc(profile.portraitUrl),
      span('.icon-check.small'),
    ]))

  const li = isolate(ListItemClickable)({
    ...sources,
    title$: profile$.pluck('fullName'),
    subtitle$: profile$.pluck('email'),
    leftDOM$: icon$,
  })

  return {
    ...li,
  }
}

const ProfileList = sources => ({
  ...List({
    ...sources,
    Control$: $.just(ProfileListItem),
    rows$: sources.profiles$,
  }),
  queue$: $.empty(),
})

const SearchResults = sources => {
  const oneProfile$ = sources.profiles$
    .map(propEq('length', 1))
    .distinctUntilChanged()
    .shareReplay(1)

  const control$ = oneProfile$.map(oneProfile =>
    oneProfile ?
      ProfileView({
        ...sources,
        profile$: sources.profiles$.map(head),
      }) :
      ProfileList(sources))

  return {
    DOM: control$.pluck('DOM').switch(),
    queue$: control$.pluck('queue$').switch(),
  }
}

const profileMatchesTerm = (term) =>
  compose(any(text => text.includes(term)), prop('search'))

const prepareText = compose(
  split(' '),
  toLower,
  join(' ')
)

const prepareProfile = profile =>
  ({...profile, search: prepareText(props(['fullName', 'email'], profile))})

const ArrivalsTab = unfetchedSources => {
  const sources = {...unfetchedSources, ...AssignmentsFetcher(unfetchedSources)}

  const preparedProfiles$ = sources.profilesWithArrival$
    .map(map(prepareProfile))
    .shareReplay(1)

  const searchBox = SearchBox(sources)
  const term$ = searchBox.term$
    .map(ifElse(Boolean, toLower, always('')))
    .distinctUntilChanged()
    .shareReplay(1)

  const profiles$ = $.combineLatest(
    term$
      .map(compose(map(profileMatchesTerm), split(' '))),
    preparedProfiles$,
    useWith(filter, [allPass]))
  .shareReplay(1)

  const list = SearchResults({...sources, profiles$, key$: searchBox.key$})

  return {
    ...searchBox,
    DOM: combineDOMsToDiv('', searchBox, list),
    queue$: list.queue$,
  }
}

export default ArrivalsTab
