import {Observable} from 'rx'
const {combineLatest} = Observable

import AppFrame from 'components/AppFrame'
import {ResponsiveTitle} from 'components/Title'
import Header from 'components/Header'
import {OppNav} from 'components/opp'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

// import {log} from 'util'

import Glance from './Glance'
import Manage from './Manage'
import Engaged from './Engaged'

const _routes = {
  '/': Glance,
  '/manage': Manage,
  '/engaged': Engaged,
}

import {
  Opps,
  ProjectImages,
  Teams,
} from 'components/remote'

import {ProjectQuickNavMenu} from 'components/project'

export default sources => {
  const opp$ = sources.oppKey$
    .flatMapLatest(Opps.query.one(sources))

  const projectKey$ = opp$.pluck('projectKey')

  const project$ = opp$.pluck('project')

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const teams$ = projectKey$
    .flatMapLatest(Teams.query.byProject(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  const page$ = nestedComponent(
    sources.router.define(_routes),
    {opp$, projectKey$, project$, teams$, opps$, ...sources}
  )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const quickNav = ProjectQuickNavMenu(
    {...sources, project$, projectKey$, opp$, teams$, opps$}
  )

  const subtitleDOM$ = combineLatest(
    sources.isMobile$,
    page$.flatMapLatest(page => page.pageTitle),
    (isMobile, pageTitle) => isMobile ? pageTitle : null,
  )

  const title = ResponsiveTitle({...sources,
    tabsDOM$: tabsDOM,
    topDOM$: quickNav.DOM,
    titleDOM$: opp$.pluck('name'),
    subtitleDOM$,
    // subtitleDOM$: page$.flatMapLatest(page => page.pageTitle),
    backgroundUrl$: projectImage$.map(i => i && i.dataUrl),
  })

  const nav = OppNav({
    titleDOM: title.DOM,
    project$,
    teams$,
    opps$,
    projectKey$,
    ...sources,
  })

  const header = Header({titleDOM: title.DOM, tabsDOM: tabsDOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

  const children = [appFrame, page$, quickNav, title, nav, header]

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
