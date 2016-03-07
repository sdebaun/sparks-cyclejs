import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import AppBar from 'components/AppBar'
import TabBar from 'components/TabBar'

import {nestedComponent, mergeOrFlatMapLatest} from 'helpers/router'
import {icon} from 'helpers/dom'
import {mobileLayout, desktopLayout} from 'helpers/layout'

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

const NavContent = sources => ({
  DOM: Observable.just(div({},'nav content')),
})

const _DOM = ({
  pageDOM, appBarDOM, tabBarDOM, navContentDOM, isMobile, isOpen,
}) =>
  (isMobile ? mobileLayout : desktopLayout)({
    bar: appBarDOM,
    tabs: tabBarDOM,
    side: navContentDOM,
    main: pageDOM,
    isOpen,
  })

export default sources => {
  const appBar = AppBar(sources) // will need to pass auth
  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})
  const navContent = NavContent(sources)

  const page$ = nestedComponent(sources.router.define(_routes),sources)

  const children = [appBar,tabBar,navContent,page$]

  const closeSideNav$ = sources.DOM.select('.close-sideNav').events('click')

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
  }).map(_DOM)

  const route$ = Observable.merge(
    mergeOrFlatMapLatest('route$',...children),
    sources.redirectLogout$
  )

  return {
    DOM,
    auth$: mergeOrFlatMapLatest('auth$',...children),
    queue$: mergeOrFlatMapLatest('queue$',...children),
    route$,
  }
}
