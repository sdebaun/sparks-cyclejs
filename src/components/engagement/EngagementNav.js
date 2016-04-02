import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'

// import {log} from 'util'

import {ListItemNavigating} from 'components/sdm'

const EngagementNav = sources => {
  const glance = isolate(ListItemNavigating,'glance')({...sources,
    title$: just('At a Glance'),
    iconName$: just('home'),
    path$: just('/'),
  })
  const app = isolate(ListItemNavigating,'app')({...sources,
    title$: just('Your Application!'),
    iconName$: just('event_note'),
    path$: just('/application'),
  })

  const listDOM$ = combineLatest(glance.DOM, app.DOM, (...doms) => doms)

  // const teamListHeader = CreateTeamHeader(sources)
  // const oppListHeader = CreateOppHeader(sources)

  // const queue$ = Observable.merge(
  //   teamListHeader.queue$,
  //   oppListHeader.queue$,
  // )

  const route$ = merge(glance.route$, app.route$)
    .map(sources.router.createHref)

  const DOM = combineLatest(
    sources.isMobile$,
    sources.titleDOM,
    listDOM$,
    (isMobile, titleDOM, listDOM) =>
      div({}, [
        isMobile ? null : titleDOM,
        div('.rowwrap', {style: {padding: '0px 15px'}}, listDOM),
      ])
  )

  return {
    DOM,
    route$,
    // queue$,
  }
}

export {EngagementNav}
