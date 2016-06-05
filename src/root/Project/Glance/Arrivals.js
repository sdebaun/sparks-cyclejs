import {Observable as $} from 'rx'
import isolate from '@cycle/isolate'
import {complement, isEmpty, filter, any, split, toLower, compose,
        map, prop, props, allPass, isNil, anyPass, join, useWith} from 'ramda'

import {div} from 'helpers'
import {combineDOMsToDiv} from 'util'

import {
  List,
  ListItem,
  InputControl,
} from 'components/sdm'

import AssignmentsFetcher from './AssignmentsFetcher'

const ProfileItem = sources => {
  const profile$ = sources.item$

  const li = ListItem({
    ...sources,
    title$: profile$.pluck('fullName'),
    subtitle$: $.just('subtitle'),
    iconSrc$: profile$.pluck('portraitUrl'),
  })

  return {
    ...li,
  }
}

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

const ProfileList = sources => {
  const list = List({
    ...sources,
    Control$: $.just(ProfileItem),
    rows$: sources.profiles$,
  })

  return list
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

const notEmptyStringΩ = complement(anyPass([isEmpty, isNil]))

const Arrivals = unfetchedSources => {
  const sources = {...unfetchedSources, ...AssignmentsFetcher(unfetchedSources)}

  const preparedProfiles$ = sources.allProfiles$
    .map(map(prepareProfile))
    .shareReplay(1)

  const searchBox = SearchBox(sources)
  const term$ = searchBox.term$.startWith('')

  const profiles$ = $.merge(
    $.combineLatest(
      term$
        .filter(notEmptyStringΩ)
        .map(compose(map(profileMatchesTerm), split(' '))),
      preparedProfiles$,
      useWith(filter, [allPass])),
    term$
      .filter(isEmpty)
      .flatMapLatest(() => preparedProfiles$)
  )

  const list = ProfileList({...sources, profiles$})

  return {
    ...searchBox,
    DOM: combineDOMsToDiv('', searchBox, list),
  }
}

export default Arrivals
