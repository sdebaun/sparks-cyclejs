import AppBar from 'components/AppBar'
import SideNav from 'components/SideNav'

import {div} from 'cycle-snabbdom'
import {Col, Row} from 'snabbdom-material'
import {mergeOrFlatMapLatest} from 'helpers/router'

export default sources => {
  const appBar = AppBar(sources) // will need to pass auth

  const sideNav = SideNav({
    contentDOM: sources.navDOM,
    isOpen$: appBar.navButton$.map(true).startWith(false),
    ...sources,
  })

  const route$ = mergeOrFlatMapLatest('route$', appBar, sideNav)

  return {
    DOM: sources.isMobile$
      .map(isMobile =>
        isMobile ?
          div({},[
            sideNav.DOM,
            appBar.DOM,
            sources.headerDOM,
            sources.pageDOM,
          ]) :
          div({},[
            appBar.DOM,
            Row({},[
              Col({type: 'xs-3'}, [sideNav.DOM]),
              Col({type: 'xs-9'}, [sources.headerDOM, sources.pageDOM]),
            ]),
          ])
      ),
    route$,
  }
}

