import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'

// import {log} from 'util'

import {CreateTeamHeader} from 'components/team'
import {CreateOppHeader} from 'components/opp'

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

  const listDOM$ = combineLatest(glance.DOM, manage.DOM, (...doms) => doms)

  const teamListHeader = CreateTeamHeader(sources)
  const oppListHeader = CreateOppHeader(sources)

  const queue$ = Observable.merge(
    teamListHeader.queue$,
    oppListHeader.queue$,
  )

  const route$ = merge(glance.route$, manage.route$)
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

  return {DOM, route$, queue$}
}

export {OppNav}
