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

const makeMainTabs = (createHref) =>
  Tabs({},[
    Tabs.Tab({id: 't1'},'t1'),
    Tabs.Tab({id: 't2'},'t2'),
    Tabs.Tab({id: 't3'},'t3'),
  ])

export default sources => {
  const {auth$, isMobile$, router} = sources
  const maskClick$ = sources.DOM.select('.close-sideNav').events('click')
  const closeSideNav$ = maskClick$.map(false)

  const appBar = AppBar(sources) // will need to pass auth

  const isOpen$ = appBar.navButton$.map(true)
    .merge(closeSideNav$)
    .startWith(false)

  return {
    // DOM: isMobile$.map( isMobile => isMobile ? mobile().DOM : desktop().DOM )
    DOM: Observable.combineLatest(isMobile$, isOpen$)
      .map(([isMobile,isOpen]) =>
        (isMobile ? mobileLayout : desktopLayout)({
          bar: appBar.DOM,
          side: div('A Wild Sidenav'),
          tabs: makeMainTabs(router.createHref),
          main: div('page content'),
          isOpen,
        })
      ),
    route$: auth$.filter(auth => !auth).map(() => '/').do(x => console.log(x)),
    auth$: appBar.auth$,
  }
}
