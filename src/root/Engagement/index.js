import {Observable} from 'rx'
const {combineLatest} = Observable
// import isolate from '@cycle/isolate'

import AppFrame from 'components/AppFrame'
import {ResponsiveTitle} from 'components/Title'
import Header from 'components/Header'
import {EngagementNav} from 'components/engagement'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

// import {log} from 'util'

import {
  Memberships,
  Commitments,
} from 'components/remote'

import Glance from './Glance'
import Application from './Application'
import Schedule from './Schedule'

const _routes = {
  '/': Glance,
  '/application': Application,
  '/schedule': Schedule,
}

// import ProjectQuickNavMenu from 'components/ProjectQuickNavMenu'

export default sources => {
  const engagement$ = sources.engagementKey$
    .flatMapLatest(key => sources.firebase('Engagements',key))

  const commitments$ = engagement$.pluck('oppKey')
    .flatMapLatest(Commitments.query.byOpp(sources))

  const opp$ = engagement$.pluck('opp')

  const projectKey$ = opp$.pluck('projectKey')
  const project$ = opp$.pluck('project')

  const projectImage$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('ProjectImages',projectKey))

  const memberships$ = sources.engagementKey$
    .flatMapLatest(Memberships.query.byEngagement(sources))

  const page$ = nestedComponent(
    sources.router.define(_routes), {
      ...sources,
      engagement$,
      opp$,
      projectKey$,
      project$,
      memberships$,
      commitments$,
    })

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  // const quickNav = ProjectQuickNavMenu(
  //   {...sources, engagement$, project$, projectKey$, opp$}
  // )

  const subtitleDOM$ = combineLatest(
    sources.isMobile$,
    page$.flatMapLatest(page => page.pageTitle),
    (isMobile, pageTitle) => isMobile ? pageTitle : null,
  )

  const title = ResponsiveTitle({...sources,
    tabsDOM$: tabsDOM,
    topDOM$: project$.pluck('name'),
    titleDOM$: opp$.pluck('name'),
    subtitleDOM$,
    backgroundUrl$: projectImage$.map(i => i && i.dataUrl),
  })

  const nav = EngagementNav({...sources,
    titleDOM: title.DOM,
    engagement$,
  })

  const header = Header({...sources,
    titleDOM: title.DOM,
    tabsDOM: tabsDOM,
  })

  const appFrame = AppFrame({...sources,
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
  })

  const children = [appFrame, page$, title, nav, header]

  const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

  const route$ = Observable.merge(
    mergeOrFlatMapLatest('route$', ...children),
    redirectOnLogout$,
  )

  return {
    DOM: appFrame.DOM,
    auth$: mergeOrFlatMapLatest('auth$', ...children),
    queue$: mergeOrFlatMapLatest('queue$', ...children),
    route$,
  }
}
