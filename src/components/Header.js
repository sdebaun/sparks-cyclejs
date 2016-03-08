import {div} from 'cycle-snabbdom'

export default sources => ({
  DOM: sources.isMobile$
    .map(isMobile =>
      div(
        {},
        [isMobile ? sources.titleDOM : sources.tabsDOM]
      )
    ),
})

