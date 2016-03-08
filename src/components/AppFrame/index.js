import AppBar from 'components/AppBar'
import SideNav from 'components/SideNav'

import {div} from 'cycle-snabbdom'
import {Col, Row} from 'snabbdom-material'
import {mergeOrFlatMapLatest} from 'helpers/router'

export default sources => {
  const appBar = AppBar(sources)

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
            div({style: {display: 'flex'}},[
              div({style: {width: '300px'}}, [sideNav.DOM]),
              div({style: {flex: 1}}, [
                sources.headerDOM,
                div({style: {padding: '0em 1em'}}, [sources.pageDOM]),
              ]),
            ]),
          ])
      ),
    route$,
  }
}

