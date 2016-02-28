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

const mainTabs =
  Tabs({},[
    Tabs.Tab({id: 't1'},'t1'),
    Tabs.Tab({id: 't2'},'t2'),
    Tabs.Tab({id: 't3'},'t3'),
    Tabs.Tab({id: 't4'},'t4'),
  ])

export default ({isMobile$}) => {
  const sidenavToggle$ = new BehaviorSubject(false)

  const appBar = AppBar({isMobile$,sidenavToggle$}) // will need to pass auth

  return {
    // DOM: isMobile$.map( isMobile => isMobile ? mobile().DOM : desktop().DOM )
    DOM: Observable.combineLatest(isMobile$,sidenavToggle$)
      .map(([isMobile,isOpen]) =>
        (isMobile ? mobileLayout : desktopLayout)({
          bar: appBar.DOM,
          side: [div('A Wild Sidenav')],
          tabs: mainTabs,
          main: div('page content'),
          onClose: () => sidenavToggle$.onNext(false),
          isOpen,
        })
      ),
  }
}
