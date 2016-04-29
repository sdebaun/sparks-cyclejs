import {Observable} from 'rx'
const {of, merge} = Observable
import {div} from 'helpers'

import {combineLatestToDiv} from 'util'

import {
  Profiles,
  Engagements,
} from 'components/remote'

import {
  List,
  ListItemNavigating,
} from 'components/sdm'

import {Detail} from './Detail'

const Item = sources => {
  const eng$ = sources.item$
    .pluck('engagementKey')
    .flatMapLatest(Engagements.query.one(sources))
    .shareReplay(1)

  // const profile$ = sources.item$.pluck('authorProfileKey')
  const profile$ = eng$
    .map(x => x && x.profileKey || x.authorProfileKey)
    .filter(x => !!x)
    .flatMapLatest(Profiles.query.one(sources))
    .shareReplay(1)

  const {DOM, route$} = ListItemNavigating({...sources,
    title$: profile$.pluck('fullName'),
    iconSrc$: profile$.pluck('portraitUrl'),
    path$: sources.item$.map(({$key}) =>
      sources.router.createHref(`/show/${$key}`)
    ),
  })

  return {
    DOM: DOM.startWith(div([null])),
    route$,
  }
}

const AppList = sources => List({...sources,
  Control$: of(Item),
  rows$: sources.memberships$,
})

const EmptyNotice = sources => ({
  DOM: sources.items$.map(i =>
    i.length > 0 ? null : div({},['Empty notice'])
  ),
})

const FilteredView = sources => {
  const detail = Detail(sources)
  const list = AppList(sources)
  const mt = EmptyNotice({...sources, items$: sources.memberships$})

  return {
    DOM: combineLatestToDiv(mt.DOM, list.DOM, detail.DOM),
    route$: merge(list.route$, detail.route$.map(sources.router.createHref)),
    queue$: detail.queue$,
  }
}

export {FilteredView}
