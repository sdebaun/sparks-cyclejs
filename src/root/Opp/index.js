import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import {div, span} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
import TabBar from 'components/TabBar'
import ComingSoon from 'components/ComingSoon'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'
import {icon} from 'helpers'

import {log} from 'util'

// import Dash from './Dash'
// import Staff from './Staff'

const _routes = {
  '/': isolate(ComingSoon('Dash')),
  // '/': isolate(Dash),
  '/leads': isolate(ComingSoon('Leads')),
  '/find': isolate(ComingSoon('Find')),
}

const _tabs = [
  {path: '/', label: 'Dash'},
  {path: '/leads', label: 'Leads'},
  {path: '/find', label: 'Find'},
]

const Nav = sources => ({
  DOM: sources.isMobile$
    .map(isMobile =>
      div(
        {},
        [isMobile ? null : sources.titleDOM, 'Nav Items']
      )
    ),
})

import ProjectQuickNavMenu from 'components/ProjectQuickNavMenu'

export default sources => {
  const opp$ = sources.oppKey$
    .flatMapLatest(key => sources.firebase('Opps',key))

  const projectKey$ = opp$.pluck('projectKey')

  const teams$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Teams', {
      orderByChild: 'projectKey',
      equalTo: projectKey,
    }))

  const opps$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Opps', {
      orderByChild: 'projectKey',
      equalTo: projectKey,
    }))

  const project$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Projects',projectKey))

  const page$ = nestedComponent(
    sources.router.define(_routes),
    {opp$, project$, projectKey$, ...sources}
  )

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})
  const quickNav = ProjectQuickNavMenu({...sources, project$, projectKey$, opp$, teams$, opps$})

  const title = Title({
    quickNavDOM$: quickNav.DOM,
    tabsDOM$: tabBar.DOM,
    labelText$: opp$.pluck('name'),
    subLabelText$: Observable.just('At a Glance'), // eventually page$.something
    ...sources,
  })

  const nav = Nav({titleDOM: title.DOM, ...sources})

  const header = Header({titleDOM: title.DOM, tabsDOM: tabBar.DOM, ...sources})

  const appFrame = AppFrame({
    navDOM: nav.DOM,
    headerDOM: header.DOM,
    pageDOM: page$.pluck('DOM'),
    ...sources,
  })

  const children = [appFrame, page$, tabBar, quickNav, title, nav, header]

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
