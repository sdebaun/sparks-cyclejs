import {Observable} from 'rx'
const {of, combineLatest} = Observable

import {TabbedPage} from 'components/ui'

import {FilteredView} from './FilteredView'

import {FetchEngagements} from '../FetchEngagements'

const _TabMaker = sources => ({
  tabs$: combineLatest(
    sources.applied$,
    sources.priority$,
    sources.ok$,
    sources.never$,
    // sources.confirmed$,
    (ap,pr,ok,nv,cf) => [
      {path: '/', label: `${ap.length} Applied`},
      // cf.length > 0 && {path: '/confirmed', label: `${cf.length} Confirmed`},
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
// const Confirmed = sources => FilteredView({...sources,
  // engagements$: sources.confirmed$,
// })

export default sources => {
  // const _sources = {...sources, ...FetchEngagements(sources)}
  const _sources = sources

  return {
    pageTitle: of('Engaged Volunteers'),

    ...TabbedPage({..._sources,
      tabs$: _TabMaker(_sources).tabs$,
      routes$: of({
        '/': Applied,
        // '/confirmed': Confirmed,
        '/priority': Priority,
        '/ok': OK,
        '/never': Never,
      }),
    }),
  }
}
