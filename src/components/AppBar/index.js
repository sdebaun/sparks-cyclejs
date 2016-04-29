import {Toolbar} from 'components/sdm'

import AppMenu from 'components/AppMenu'
import HeaderLogo from 'components/HeaderLogo'

import {sidenavButton} from 'components/Title'

const AppBar = sources => {
  const appMenu = AppMenu(sources)
  const headerLogo = HeaderLogo(sources)

  return {
    auth$: appMenu.auth$,
    route$: appMenu.route$,
    ...Toolbar({
      ...sources,
      leftItemDOM$: sources.isMobile$.map(m => m ? sidenavButton : null),
      titleDOM$: headerLogo.DOM,
      rightItemDOM$: appMenu.DOM,
    }),
  }
}

export {AppBar}
