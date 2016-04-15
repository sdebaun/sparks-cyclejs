import {Observable} from 'rx'
const {just, merge} = Observable
import {div} from 'helpers'

// import {log} from 'util'
import {combineLatestToDiv} from 'util'

import {
  List,
  ListItemNavigating,
} from 'components/sdm'

import {
  Profiles,
  Engagements,
} from 'components/remote'

import Detail from './Detail'

const Item = sources => {
  const profile$ = sources.item$
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
  Control$: just(Item),
  rows$: sources.engagements$,
})

const EmptyNotice = sources => ({
  DOM: sources.items$.map(i =>
    i.length > 0 ? null : div({},['Empty notice'])
  ),
})

const isNotAccepted = ({isAccepted}) => isAccepted === false
const isDeclined = ({declined}) => declined === true

const Fetch = sources => ({
  engagements$: sources.applied$.shareReplay(1),
  // engagements$: sources.oppKey$
  //   .flatMapLatest(Engagements.query.byOpp(sources))
  //   .map(engagements =>
  //     engagements.filter(x => !isDeclined(x) && isNotAccepted(x))
  //   )
  //   .shareReplay(1),
})

export default sources => {
  const _sources = {...sources, ...Fetch(sources)}

  const detail = Detail(_sources)
  const list = AppList(_sources)
  const mt = EmptyNotice({..._sources, items$: _sources.engagements$})

  return {
    DOM: combineLatestToDiv(mt.DOM, list.DOM, detail.DOM),
    route$: merge(list.route$, detail.route$),
    queue$: detail.queue$,
  }
}
