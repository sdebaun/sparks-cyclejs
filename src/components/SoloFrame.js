import AppBar from 'components/AppBar'
import SideNav from 'components/SideNav'

import {mobileFrame, desktopFrame} from 'helpers'
import {mergeOrFlatMapLatest} from 'util'

export default sources => {
  const appBar = AppBar(sources)

  const auth$ = appBar.auth$
  const route$ = appBar.route$

  const layoutParams = {
    appBar: appBar.DOM,
    header: sources.headerDOM,
    page: sources.pageDOM,
  }

  const DOM = sources.isMobile$.map(isMobile =>
    isMobile ? mobileFrame(layoutParams) : desktopFrame(layoutParams)
  )

  return {DOM, auth$, route$}
}