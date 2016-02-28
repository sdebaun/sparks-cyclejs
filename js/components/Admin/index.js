import {BehaviorSubject,Observable} from 'rx'
import {div} from 'cycle-snabbdom'

import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import {Sidenav, Col, Row} from 'snabbdom-material'
import Tabs from 'components/Tabs'
import AppMenu from 'components/AppMenu'
import AppBar from 'components/AppBar'

import {icon} from 'helpers/dom'
import {mobileLayout, desktopLayout} from 'helpers/layout'

import Dash from './Dash.js'
import Projects from './Projects.js'
import Profiles from './Profiles.js'

const mainTabs =
  Tabs({},[
    Tabs.Tab({id: '.'},'Dash'),
    Tabs.Tab({id: './projects'},'Projects'),
    Tabs.Tab({id: './profiles'},'Profiles'),
  ])

const routes = {
  '/': Dash,
  '/projects': Projects,
  '/profiles': Profiles,
}

export default ({isMobile$,router,...sources}) => {
  const sidenavToggle$ = new BehaviorSubject(false)

  const {path$, value$} = router.define(routes)

  const page$ = path$.zip(value$,
    (path, value) => value({...sources, isMobile$, router: router.path(path)})
  ).shareReplay(1)

  const appBar = AppBar({isMobile$,sidenavToggle$}) // will need to pass auth

  page$.flatMapLatest(({queue$}) => queue$)
  .subscribe(x => console.log('page$.queue$',x))

  // page$.subscribe(({queue$}) => console.log('new page$',queue$))

  return {
    DOM: Observable.combineLatest(page$,isMobile$,sidenavToggle$)
      .map(([page,isMobile,isOpen]) =>
        (isMobile ? mobileLayout : desktopLayout)({
          bar: appBar.DOM,
          side: [div('A Wild Sidenav')],
          tabs: mainTabs,
          main: page.DOM,
          onClose: () => sidenavToggle$.onNext(false),
          isOpen,
        })
      ),
    queue$: page$.flatMapLatest(({queue$}) => queue$),
  }
}
