// import {Observable} from 'rx'
// import combineLatestObj from 'rx-combine-latest-obj'

// import {div} from 'cycle-snabbdom'

// import AppBar from 'components/AppBar'
// import TabBar from 'components/TabBar'

// import {nestedComponent, mergeOrFlatMapLatest} from 'util'
// import {icon} from 'helpers'
// import {layoutDOM} from 'helpers/layout'

import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import AppFrame from 'components/AppFrame'
import Title from 'components/Title'
import Header from 'components/Header'
import TabBar from 'components/TabBar'

import {nestedComponent, mergeOrFlatMapLatest} from 'util'
import {icon} from 'helpers'

import ComingSoon from 'components/ComingSoon'

import Doing from './Doing'

const _routes = {
  '/': Doing,
  '/finding': ComingSoon('Dash/Finding'),
  '/being': ComingSoon('Dash/Being'),
}

const _tabs = [
  {path: '/', label: 'Doing'},
  {path: '/finding', label: 'Finding'},
  {path: '/being', label: 'Being'},
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
    labelText$: Observable.just('Your Name'),
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
//   }).map(layoutDOM)

//   const route$ = Observable.merge(
//     mergeOrFlatMapLatest('route$', ...children),
//     sources.redirectLogout$,
//   )

//   return {
//     DOM,
//     auth$: mergeOrFlatMapLatest('auth$', ...children),
//     queue$: mergeOrFlatMapLatest('queue$', ...children),
//     route$,
//   }
// }
