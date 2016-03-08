import AppBar from 'components/AppBar'
import SideNav from 'components/SideNav'

import {div} from 'cycle-snabbdom'
import {Col, Row} from 'snabbdom-material'
import {mergeOrFlatMapLatest} from 'util'

export default sources => {
  const appBar = AppBar(sources)

  const navButton$ = sources.DOM.select('.nav-button').events('click')

  const sideNav = SideNav({
    contentDOM: sources.navDOM,
    isOpen$: navButton$.map(true).startWith(false),
    ...sources,
  })

  const children = [appBar, sideNav]

  const auth$ = mergeOrFlatMapLatest('auth$', ...children)
  const route$ = mergeOrFlatMapLatest('route$', ...children)

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
    auth$,
    route$,
  }
}

