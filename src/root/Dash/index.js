import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

// why arent these in root/index??
import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import AppBar from 'components/AppBar'
import TabBar from 'components/TabBar'

import {nestedComponent, mergeOrFlatMapLatest} from 'helpers/router'
import {icon} from 'helpers/dom'
import {layoutDOM} from 'helpers/layout'

import Doing from './Doing'

const _routes = {
  '/': Doing,
  // '/finding': Finding,
  // '/being': Being,
}

const _tabs = [
  {path: '/', label: 'Doing'},
  // {path: '/finding', label: 'Finding'},
  // {path: '/being', label: 'Being'},
]

const NavContent = sources => ({
  DOM: Observable.just(div({},'nav content')),
})

export default sources => {
  const appBar = AppBar(sources) // will need to pass auth
  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})
  const navContent = NavContent(sources)

  const page$ = nestedComponent(sources.router.define(_routes),sources)

  const children = [appBar,tabBar,navContent,page$]

  const closeSideNav$ = sources.DOM.select('.close-sideNav').events('click')

  // const redirectOnLogout$ = sources.auth$.filter(auth => !auth).map(() => '/')

  const sidenavOpen$ = appBar.navButton$.map(true)
    .merge(closeSideNav$.map(false))
    .startWith(false)

  const DOM = combineLatestObj({
    pageDOM$: page$.pluck('DOM'),
    appBarDOM$: appBar.DOM,
    tabBarDOM$: tabBar.DOM,
    navContentDOM$: navContent.DOM,
    isMobile$: sources.isMobile$,
    isOpen: sidenavOpen$,
  }).map(layoutDOM)

  return {
    DOM,
    queue$: mergeOrFlatMapLatest('queue$', ...children),
    route$: sources.redirectLogout$.merge(
      mergeOrFlatMapLatest('route$', ...children),
    ),
    auth$: mergeOrFlatMapLatest('auth$', ...children),
  }
}
