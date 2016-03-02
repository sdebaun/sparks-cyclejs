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

import Dash from './Dash.js'
import Projects from './Projects.js'
import Profiles from './Profiles.js'

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

  return {
    DOM,
    queue$: mergeOrFlatMapLatest('queue$',...children),
    route$: mergeOrFlatMapLatest('route$',...children),
    auth$: mergeOrFlatMapLatest('auth$',...children),
  }
}

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
