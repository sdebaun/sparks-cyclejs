import {Observable} from 'rx'
const {of, merge} = Observable
import {div} from 'helpers'

import {combineLatestToDiv} from 'util'

import {
  Profiles,
} from 'components/remote'

import {
  List,
  ListItemNavigating,
} from 'components/sdm'

import {Detail} from './Detail'

const Item = sources => {
  const profile$ = sources.item$
    .tap(i => !i.profileKey && console.log('item no profileKey', i))
    .pluck('profileKey')
    .flatMapLatest(Profiles.query.one(sources))
    .shareReplay(1)

  return ListItemNavigating({...sources,
    title$: profile$.pluck('fullName'),
    iconSrc$: profile$.pluck('portraitUrl'),
    path$: sources.item$.map(({$key}) =>
      sources.router.createHref(`/show/${$key}`)
    ),
  })
}

const AppList = sources => List({...sources,
  Control$: of(Item),
  rows$: sources.engagements$,
})

const EmptyNotice = sources => ({
  DOM: sources.items$.map(i =>
    i.length > 0 ? null : div({},['Empty notice'])
  ),
})

const FilteredView = sources => {
  const detail = Detail(sources)
  const list = AppList(sources)
  const mt = EmptyNotice({...sources, items$: sources.engagements$})

  return {
    DOM: combineLatestToDiv(mt.DOM, list.DOM, detail.DOM),
    route$: merge(list.route$, detail.route$.map(sources.router.createHref)),
    queue$: detail.queue$,
  }
}

export {FilteredView}
