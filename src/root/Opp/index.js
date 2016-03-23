import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'
// import isolate from '@cycle/isolate'

// import {div, span} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
// import TabBar from 'components/TabBar'
// import ComingSoon from 'components/ComingSoon'
import {OppNav} from 'components/opp'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'

// import {log} from 'util'

import Glance from './Glance'
import Manage from './Manage'

const _routes = {
  '/': Glance,
  '/manage': Manage,
  // '/leads': isolate(ComingSoon('Leads')),
  // '/find': isolate(ComingSoon('Find')),
  // '/manage': isolate(ComingSoon('Manage')),
}

import ProjectQuickNavMenu from 'components/ProjectQuickNavMenu'

export default sources => {
  const opp$ = sources.oppKey$
    .flatMapLatest(key => sources.firebase('Opps',key))

  const projectKey$ = opp$.pluck('projectKey')

  const project$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Projects',projectKey))

  const projectImage$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('ProjectImages',projectKey))

  const teams$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Teams',{
      orderByChild: 'projectKey',
      equalTo: projectKey,
    }))

  const opps$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Opps', {
      orderByChild: 'projectKey',
      equalTo: projectKey,
    }))

  const page$ = nestedComponent(
    sources.router.define(_routes),
    {opp$, projectKey$, project$, teams$, opps$, ...sources}
  )

  const tabsDOM = page$.flatMapLatest(page => page.tabBarDOM)

  const quickNav = ProjectQuickNavMenu(
    {...sources, project$, projectKey$, opp$, teams$, opps$}
  )

  const labelText$ = opp$.pluck('name')
  const subLabelText$ = page$.flatMapLatest(page => page.pageTitle)

  const title = Title({
    quickNavDOM$: quickNav.DOM,
    tabsDOM$: tabsDOM,
    labelText$,
    subLabelText$,
    backgroundUrl$: projectImage$.map(pi => pi && pi.dataUrl),
    ...sources,
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
