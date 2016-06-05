import {Observable as $} from 'rx'
import isolate from '@cycle/isolate'

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
  const input = InputControl({
    label$: $.of('Search'),
    ...sources,
  })

  return {
    ...input,
  }
}

const ProfileList = sources => {
  const list = List({
    ...sources,
    Control$: $.just(ProfileItem),
    rows$: sources.allProfiles$,
  })

  return list
}

const Arrivals = unfetchedSources => {
  const sources = {...unfetchedSources, ...AssignmentsFetcher(unfetchedSources)}

  const searchBox = SearchBox(sources)
  const list = ProfileList(sources)

  return {
    DOM: combineDOMsToDiv('', searchBox, list),
  }
}

export default Arrivals
