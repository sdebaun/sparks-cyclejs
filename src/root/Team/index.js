import {Observable} from 'rx'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
// import {OppNav} from 'components/opp'

import ComingSoon from 'components/ComingSoon'
const TeamNav = ComingSoon('Foo')

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

// import {log} from 'util'

import {
  ProjectImages,
  Teams,
  Opps,
} from 'components/remote'

import Glance from './Glance'
import Manage from './Manage'

const _routes = {
  '/': Glance,
  '/manage': Manage,
}

import {ProjectQuickNavMenu} from 'components/project'

export default sources => {
  const team$ = sources.teamKey$
    .flatMapLatest(key => sources.firebase('Teams',key))

  const projectKey$ = team$.pluck('projectKey')

  const project$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Projects',projectKey))

  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  const teams$ = projectKey$
    .flatMapLatest(Teams.query.byProject(sources))

  const opps$ = projectKey$
    .flatMapLatest(Opps.query.byProject(sources))

  const page$ = nestedComponent(
    sources.router.define(_routes),
    {team$, projectKey$, project$, teams$, opps$, ...sources}
  )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const quickNav = ProjectQuickNavMenu(
    {...sources, project$, projectKey$, team$, teams$, opps$}
  )

  const labelText$ = team$.pluck('name')
  const subLabelText$ = page$.flatMapLatest(page => page.pageTitle)

  const title = Title({
    quickNavDOM$: quickNav.DOM,
    tabsDOM$: tabsDOM,
    labelText$,
    subLabelText$,
    backgroundUrl$: projectImage$.map(pi => pi && pi.dataUrl),
    ...sources,
  })

  const nav = TeamNav({
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
