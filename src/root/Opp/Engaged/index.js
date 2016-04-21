import {Observable} from 'rx'
const {of, combineLatest} = Observable

import {TabbedPage} from 'components/ui'

import {
  Engagements,
} from 'components/remote'

import {FilteredView} from './FilteredView'

const filterApplied = e =>
  e.filter(x => !x.isAccepted && !x.declined && !x.isConfirmed)
const filterPriority = e =>
  e.filter(x => x.isAccepted && x.priority && !x.isConfirmed)
const filterOK = e =>
  e.filter(x => x.isAccepted && !x.priority && !x.isConfirmed)
const filterNever = e =>
  e.filter(x => !x.isAccepted && x.declined && !x.isConfirmed)
const filterConfirmed = e =>
  e.filter(x => x.isConfirmed)

const _Fetch = sources => {
  const all$ = sources.oppKey$
    .flatMapLatest(Engagements.query.byOpp(sources))
    .shareReplay(1)

  const errored$ = all$
    .map(engs => engs.filter(e => !e.profileKey)) // filter out naughty records
    .subscribe(engs => console.log('Applications with errors:', engs))

  const e$ = all$
    .map(engs => engs.filter(e => !!e.profileKey)) // filter out naughty records
    .shareReplay(1)

  return {
    engagements$: e$,
    applied$: e$.map(filterApplied).shareReplay(1),
    priority$: e$.map(filterPriority).shareReplay(1),
    ok$: e$.map(filterOK).shareReplay(1),
    never$: e$.map(filterNever).shareReplay(1),
    confirmed$: e$.map(filterConfirmed).shareReplay(1),
  }
}

const _TabMaker = sources => ({
  tabs$: combineLatest(
    sources.applied$,
    sources.priority$,
    sources.ok$,
    sources.never$,
    sources.confirmed$,
    (ap,pr,ok,nv,cf) => [
      {path: '/', label: `${ap.length} Applied`},
      cf.length > 0 && {path: '/confirmed', label: `${cf.length} Confirmed`},
      pr.length > 0 && {path: '/priority', label: `${pr.length} Priority`},
      ok.length > 0 && {path: '/ok', label: `${ok.length} OK`},
      nv.length > 0 && {path: '/never', label: `${nv.length} Never`},
    ].filter(x => !!x)
  ),
})

const Applied = sources => FilteredView({...sources,
  engagements$: sources.applied$,
})
const Priority = sources => FilteredView({...sources,
  engagements$: sources.priority$,
})
const OK = sources => FilteredView({...sources,
  engagements$: sources.ok$,
})
const Never = sources => FilteredView({...sources,
  engagements$: sources.never$,
})
const Confirmed = sources => FilteredView({...sources,
  engagements$: sources.confirmed$,
})

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  return {
    pageTitle: of('Engaged Volunteers'),

    ...TabbedPage({..._sources,
      tabs$: _TabMaker(_sources).tabs$,
      routes$: of({
        '/': Applied,
        '/confirmed': Confirmed,
        '/priority': Priority,
        '/ok': OK,
        '/never': Never,
      }),
    }),
  }
}
