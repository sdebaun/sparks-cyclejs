import {Observable} from 'rx'
const {combineLatest} = Observable

import AppFrame from 'components/AppFrame'
import Header from 'components/Header'
import {ProjectNav} from 'components/project'
// import ComingSoon from 'components/ComingSoon'

import {ResponsiveTitle} from 'components/Title'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

import Glance from './Glance'
import Manage from './Manage'

const _routes = {
  // isolating breaks child tab navigation?
  '/': Glance,
  '/manage': Manage,
}

import {
  Projects,
  ProjectImages,
  Teams,
  Opps,
  Organizers,
} from 'components/remote'

const Fetch = sources => {
  const projectKey$ = sources.projectKey$

  const project$ = sources.projectKey$
    .flatMapLatest(Projects.query.one(sources))

  const projectImage$ = sources.projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const teams$ = sources.projectKey$
    .flatMapLatest(Teams.query.byProject(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  const organizers$ = sources.projectKey$
    .flatMapLatest(Organizers.query.byProject(sources))

  return {
    projectKey$,
    project$,
    projectImage$,
    teams$,
    opps$,
    organizers$,
  }
}

export default _sources => {
  const sources = {..._sources, ...Fetch(_sources)}

  const page$ = nestedComponent(
    _sources.router.define(_routes),
    sources
  )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const subtitleDOM$ = combineLatest(
    sources.isMobile$,
    page$.flatMapLatest(page => page.pageTitle),
    (isMobile, pageTitle) => isMobile ? pageTitle : null,
  )

  const title = ResponsiveTitle({...sources,
    tabsDOM$: tabsDOM,
    titleDOM$: sources.project$.pluck('name'),
    subtitleDOM$,
    backgroundUrl$: sources.projectImage$.map(i => i && i.dataUrl),
  })

  const nav = ProjectNav({...sources,
    titleDOM: title.DOM,
  })

  const header = Header({titleDOM: title.DOM, tabsDOM, ...sources})

  const appFrame = AppFrame({
    // navDOM: sources.navDOM$,
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
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
    focus$: mergeOrFlatMapLatest('focus$', ...children),
    route$,
  }
}
