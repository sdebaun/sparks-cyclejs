import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'

// import {log} from 'util'

import {ListItemNavigating} from 'components/sdm'

const OppNav = sources => {
  const glance = isolate(ListItemNavigating,'glance')({...sources,
    title$: just('At a Glance'),
    iconName$: just('home'),
    path$: just('/'),
  })
  const manage = isolate(ListItemNavigating,'manage')({...sources,
    title$: just('Manage'),
    iconName$: just('settings'),
    path$: just('/manage'),
  })
  const engaged = isolate(ListItemNavigating,'engaged')({...sources,
    title$: just('Engaged'),
    iconName$: just('people'),
    path$: just('/engaged'),
  })

  const listDOM$ = combineLatest(
    glance.DOM, manage.DOM, engaged.DOM,
    (...doms) => doms
  )

  const route$ = merge(glance.route$, manage.route$, engaged.route$)
    .map(sources.router.createHref)

  const DOM = combineLatest(
    sources.isMobile$,
    sources.titleDOM,
    listDOM$,
    (isMobile, titleDOM, listDOM) =>
      div({}, [
        isMobile ? null : titleDOM,
        div('.rowwrap', listDOM),
      ])
  )

  return {
    DOM,
    route$,
  }
}

export {OppNav}
