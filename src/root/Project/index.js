import {Observable} from 'rx'

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

export default sources => {
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

  const page$ = nestedComponent(
    sources.router.define(_routes),
    {project$, projectImage$, teams$, organizers$, ...sources}
  )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const title = ResponsiveTitle({...sources,
    tabsDOM$: tabsDOM,
    titleDOM$: project$.pluck('name'),
    subtitleDOM$: page$.flatMapLatest(page => page.pageTitle),
    backgroundUrl$: projectImage$.map(i => i && i.dataUrl),
  })

  const nav = ProjectNav({
    titleDOM: title.DOM,
    project$,
    teams$,
    opps$,
    ...sources,
  })

  const header = Header({titleDOM: title.DOM, tabsDOM, ...sources})

  const appFrame = AppFrame({
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
    route$,
  }
}
