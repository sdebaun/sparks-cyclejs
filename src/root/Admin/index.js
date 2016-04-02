import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
import TabBar from 'components/TabBar'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'
// import {icon} from 'helpers'

import ComingSoon from 'components/ComingSoon'

import Projects from './Projects.js'

const _routes = {
  '/': Projects,
  '/profiles': ComingSoon('Admin/Dash'),
  '/previously': ComingSoon('Admin/Previously'),
}

const _tabs = [
  {path: '/', label: 'Projects'},
  {path: '/profiles', label: 'Profiles'},
  {path: '/previously', label: 'Previously'},
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

export default sources => {
  const page$ = nestedComponent(sources.router.define(_routes),sources)

  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})

  const title = Title({
    tabsDOM$: tabBar.DOM,
    labelText$: Observable.just('Administration'),
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

  const children = [appFrame, page$, tabBar, title, nav, header]

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
