import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
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

// const NavContent = sources => ({
//   DOM: Observable.just(div({},'nav content')),
// })

// const _DOM = ({
//   pageDOM, appBarDOM, tabBarDOM, navContentDOM, isMobile, isOpen,
// }) =>
//   (isMobile ? mobileLayout : desktopLayout)({
//     bar: appBarDOM,
//     tabs: tabBarDOM,
//     side: navContentDOM,
//     main: pageDOM,
//     isOpen,
//   })

// export default sources => {
//   const appBar = AppBar(sources) // will need to pass auth
//   const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})
//   const navContent = NavContent(sources)

//   const page$ = nestedComponent(sources.router.define(_routes),sources)

//   const children = [appBar,tabBar,navContent,page$]

//   const closeSideNav$ = sources.DOM.select('.close-sideNav').events('click')

//   const sidenavOpen$ = appBar.navButton$.map(true)
//     .merge(closeSideNav$.map(false))
//     .startWith(false)

//   const DOM = combineLatestObj({
//     pageDOM$: page$.pluck('DOM'),
//     appBarDOM$: appBar.DOM,
//     tabBarDOM$: tabBar.DOM,
//     navContentDOM$: navContent.DOM,
//     isMobile$: sources.isMobile$,
//     isOpen: sidenavOpen$,
//   }).map(_DOM)

//   const route$ = Observable.merge(
//     mergeOrFlatMapLatest('route$',...children),
//     sources.redirectLogout$
//   )

//   return {
//     DOM,
//     auth$: mergeOrFlatMapLatest('auth$',...children),
//     queue$: mergeOrFlatMapLatest('queue$',...children),
//     route$,
//   }
// }
