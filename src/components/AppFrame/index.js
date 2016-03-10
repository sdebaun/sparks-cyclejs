import AppBar from 'components/AppBar'
import SideNav from 'components/SideNav'

import {mobileFrame, desktopFrame} from 'helpers'
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

  const layoutParams = {
    sideNav: sideNav.DOM,
    appBar: appBar.DOM,
    header: sources.headerDOM,
    page: sources.pageDOM,
  }

  const DOM = sources.isMobile$.map(isMobile =>
    isMobile ? mobileFrame(layoutParams) : desktopFrame(layoutParams)
  )

  return {
    DOM,
    auth$,
    route$,
  }
}
