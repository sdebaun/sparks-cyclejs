import {Observable} from 'rx'
const {combineLatest} = Observable
// import isolate from '@cycle/isolate'

import AppFrame from 'components/AppFrame'
import {ResponsiveTitle} from 'components/Title'
import Header from 'components/Header'
import {ProjectQuickNavMenu} from 'components/project/ProjectQuickNavMenu'
import {EngagementNav} from 'components/engagement'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

// import {log} from 'util'

import {
  Memberships,
  Commitments,
  Opps,
  Projects,
  ProjectImages,
  Teams,
} from 'components/remote'

import Glance from './Glance'
import Application from './Application'
import Schedule from './Schedule'

const _routes = {
  '/': Glance,
  '/application': Application,
  '/schedule': Schedule,
}

export default sources => {
  const engagement$ = sources.engagementKey$
    .flatMapLatest(key => sources.firebase('Engagements',key))

  const oppKey$ = engagement$.pluck('oppKey')

  const commitments$ = oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const opp$ = oppKey$
    .flatMapLatest(Opps.query.one(sources))

  const projectKey$ = opp$.pluck('projectKey')

  const project$ = projectKey$
    .flatMapLatest(Projects.query.one(sources))

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const memberships$ = sources.engagementKey$
    .flatMapLatest(Memberships.query.byEngagement(sources))

  const teams$ = projectKey$
    .flatMapLatest(Teams.query.byProject(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  const page$ = nestedComponent(
    sources.router.define(_routes), {
      ...sources,
      engagement$,
      oppKey$,
      opp$,
      projectKey$,
      project$,
      memberships$,
      commitments$,
    })

  // const quickNav = ProjectQuickNavMenu(
  //   {...sources, project$, projectKey$, opp$, teams$, opps$}
  // )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const subtitleDOM$ = combineLatest(
    sources.isMobile$,
    page$.flatMapLatest(page => page.pageTitle),
    (isMobile, pageTitle) => isMobile ? pageTitle : null,
  )

  const title = ResponsiveTitle({...sources,
    tabsDOM$: tabsDOM,
    // topDOM$: quickNav.DOM,
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
