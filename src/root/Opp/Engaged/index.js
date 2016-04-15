import {Observable} from 'rx'
const {of, combineLatest} = Observable

import {TabbedPage} from 'components/ui'

import Applied from './Applied'

import {
  Profiles,
  Engagements,
} from 'components/remote'

const _TabMaker = sources => ({
  tabs$: combineLatest(
    sources.applied$,
    sources.priority$,
    sources.ok$,
    sources.never$,
    (ap,pr,ok,nv) => [
      {path: '/', label: `${ap.length} Applied`},
      {path: '/priority', label: `${pr.length} Priority`},
      {path: '/ok', label: `${ok.length} OK`},
      {path: '/never', label: `${nv.length} Never`},
    ]
  ),
})

const filterApplied = e => e.filter(x => !x.isAccepted && !x.declined)
const filterPriority = e => e.filter(x => x.isAccepted && x.priority)
const filterOK = e => e.filter(x => x.isAccepted && !x.priority)
const filterNever = e => e.filter(x => !x.isAccepted && x.declined)
const _Fetch = sources => {
  const e$ = sources.oppKey$
    .flatMapLatest(Engagements.query.byOpp(sources))
    .shareReplay(1)

  return {
    engagements$: e$,
    applied$: e$.map(filterApplied),
    priority$: e$.map(filterPriority),
    ok$: e$.map(filterOK),
    never$: e$.map(filterNever),
  }
}

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  return {
    pageTitle: of('Engaged Volunteers'),

    ...TabbedPage({..._sources,
      tabs$: _TabMaker(_sources).tabs$,
      routes$: of({
        '/': Applied,
        // '/priority': Priority,
        // '/ok': OK,
        // '/never': Never,
      }),
    }),
  }
}
