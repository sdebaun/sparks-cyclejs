import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'

// import {log} from 'util'

import {ListItemNavigating} from 'components/sdm'

import {mergeSinks, combineLatestToDiv} from 'util'

const _Glance = sources => ListItemNavigating({...sources,
  title$: just('At a Glance'),
  iconName$: just('home'),
  path$: just('/'),
})

const _Manage = sources => ListItemNavigating({...sources,
  title$: just('Manage'),
  iconName$: just('settings'),
  path$: just('/manage'),
})

const _Confirmed = sources => ListItemNavigating({...sources,
  title$: sources.confirmed$.map(c => `${c.length || 0} Confirmed`),
  iconName$: just('people'),
  path$: just('/confirmed'),
})

const _Engaged = sources => ListItemNavigating({...sources,
  title$: sources.applied$.map(c => `${c.length || 0} Applied`),
  iconName$: just('event_available'),
  path$: just('/engaged'),
})

const _List = sources => {
  const childs = [
    isolate(_Glance,'glance')(sources),
    isolate(_Manage,'manage')(sources),
    isolate(_Confirmed,'confirmed')(sources),
    isolate(_Engaged,'enaged')(sources),
  ]

  return {
    DOM: combineLatestToDiv(...childs.map(c => c.DOM)),
    route$: merge(...childs.map(c => c.route$))
      .map(sources.router.createHref),
  }
}

const OppNav = sources => {
  const l = _List(sources)

  const DOM = combineLatest(
    sources.isMobile$, sources.titleDOM, l.DOM,
    (isMobile, title, list) =>
      div({}, [isMobile ? null : title, div('.rowwrap', [list])])
  )

  return {
    DOM,
    ...mergeSinks(l),
  }
}

export {OppNav}
