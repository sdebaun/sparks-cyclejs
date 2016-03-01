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

function intent(DOM) {
  const tabClick$ = DOM.select('.tab-label-content').events('click')
  const maskClick$ = DOM.select('.mask').events('click')
  return {
    tabClick$,
    maskClick$,
  }
}

const routes = {
  '/': Dash,
  '/projects': Projects,
  '/profiles': Profiles,
}

function model(actions, sources, openSidNav$) {
  const route$ = actions.tabClick$
    .map(event => event.ownerTarget.dataset.link)
    .startWith(null)
    .distinctUntilChanged()

  const closeSideNav$ = actions.maskClick$
    .map(() => false).startWith(false)

  const isOpen$ = openSidNav$.merge(closeSideNav$)
    .startWith(false)

  return Observable.combineLatest(
    isOpen$, route$, sources.isMobile$,
    (isOpen, route, isMobile) => ({isOpen, route, isMobile})
  )
}

const makeMainTabs = (createHref) =>
  Tabs({}, [
    Tabs.Tab({id: '.', link: createHref('/')},'Dash'),
    Tabs.Tab({id: './projects', link: createHref('/projects')},'Projects'),
    Tabs.Tab({id: './profiles', link: createHref('/profiles')},'Profiles'),
  ])

function view({state$, main, bar, tabs}) {
  return state$.map(({isMobile, isOpen}) =>
    (isMobile ? mobileLayout : desktopLayout)({
      main, bar,
      tabs, isOpen,
      side: [div({}, ['A wild sidenav'])],
    })
  )
}

const filterNull = x => x !== null

export default sources => {
  const actions = intent(sources.DOM)

  const appBar = AppBar(sources) // will need to pass auth

  const state$ = model(actions, sources, appBar.openSidNav$)

  const match = sources.router.define(routes)
  const page$ = nestedComponent(match, sources)

  const _queue$ = page$.flatMapLatest(
    ({queue$}) => queue$ ? queue$ : Observable.empty()
  ).filter(filterNull).distinctUntilChanged()

  const route$ = state$.pluck('route')
    .filter(filterNull).distinctUntilChanged()

  const view$ = view({
    state$,
    main: page$.flatMapLatest(({DOM}) => DOM),
    bar: appBar.DOM,
    tabs: makeMainTabs(sources.router.createHref),
  })

  return {
    DOM: view$,
    queue$: _queue$,
    route$,
  }
}
