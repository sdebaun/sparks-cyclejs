import {BehaviorSubject,Observable} from 'rx'
import {div} from 'cycle-snabbdom'

import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import {Sidenav, Col, Row} from 'snabbdom-material'
import Tabs from 'components/Tabs'
import AppMenu from 'components/AppMenu'
import AppBar from 'components/AppBar'

import {nestedComponent} from 'helpers/router'
import {icon} from 'helpers/dom'
import {mobileLayout, desktopLayout} from 'helpers/layout'

import Dash from './Dash.js'
import Projects from './Projects.js'
import Profiles from './Profiles.js'

// function intent(DOM) {
//   const tabClick$ = DOM.select('.tab-label-content').events('click')
//   const maskClick$ = DOM.select('.mask').events('click')
//   return {
//     tabClick$,
//     maskClick$,
//   }
// }

// function model(actions, sources, openSidNav$) {
//   const route$ = actions.tabClick$
//     .map(event => event.ownerTarget.dataset.link)
//     .startWith(null)
//     .distinctUntilChanged()

//   const closeSideNav$ = actions.maskClick$
//     .map(() => false).startWith(false)

//   const isOpen$ = openSidNav$.merge(closeSideNav$)
//     .startWith(false)

//   return Observable.combineLatest(
//     isOpen$, route$, sources.isMobile$,
//     (isOpen, route, isMobile) => ({isOpen, route, isMobile})
//   )
// }

// const makeMainTabs = (createHref) =>
//   Tabs({}, [
//     Tabs.Tab({id: '.', link: createHref('/')},'Dash'),
//     Tabs.Tab({id: './projects', link: createHref('/projects')},'Projects'),
//     Tabs.Tab({id: './profiles', link: createHref('/profiles')},'Profiles'),
//   ])

// function view({state$, main, bar, tabs}) {
//   return state$.map(({isMobile, isOpen}) =>
//     (isMobile ? mobileLayout : desktopLayout)({
//       main, bar,
//       tabs, isOpen,
//       side: [div({}, ['A wild sidenav'])],
//     })
//   )
// }

// const filterNull = x => x !== null

const _routes = {
  '/': Dash,
  '/projects': Projects,
  '/profiles': Profiles,
}

const _tabs = [
  {path: '/', label: 'Dash'},
  {path: '/projects', label: 'Projects'},
  {path: '/profiles', label: 'Profiles'},
]

const NavContent = sources => ({
  DOM: Observable.just(div({},'nav content')),
})

const mergeOrFlatMapLatest = (prop, ...sourceArray) =>
  Observable.merge(
    sourceArray.map(src => // array map not observable!
      src.source ? // if it has .source, its observable
        src.flatMapLatest(l => l[prop] || Observable.empty()) :
        // otherwise look for a prop
        src[prop] || Observable.empty()
    )
  )

const DOMx = state$ =>
  state$.map(({
    pageDOM, appBarDOM, tabBarDOM, navContentDOM, isMobile, isOpen,
  }) =>
    (isMobile ? mobileLayout : desktopLayout)({
      bar: appBarDOM,
      tabs: tabBarDOM,
      side: navContentDOM,
      main: pageDOM,
      isOpen,
    })
  )

import TabBar from 'components/TabBar'

export default sources => {
  const appBar = AppBar(sources) // will need to pass auth
  const tabBar = TabBar({...sources, tabs: Observable.just(_tabs)})
  const navContent = NavContent(sources)

  const page$ = nestedComponent(sources.router.define(_routes),sources)

  const state$ = Observable.combineLatest(
    page$.pluck('DOM'), appBar.DOM, tabBar.DOM, navContent.DOM, sources.isMobile$,
    (pageDOM, appBarDOM, tabBarDOM, navContentDOM, isMobile) =>
      ({pageDOM, appBarDOM, tabBarDOM, navContentDOM, isMobile}),
  )

  return {
    DOM: DOMx(state$),
    queue$: mergeOrFlatMapLatest('queue$',appBar,tabBar,navContent,page$),
    route$: mergeOrFlatMapLatest('route$',appBar,tabBar,navContent,page$),
  }
}
