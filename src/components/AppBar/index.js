import {Toolbar} from 'components/sdm'

import AppMenu from 'components/AppMenu'
import HeaderLogo from 'components/HeaderLogo'

const AppBar = sources => {
  const appMenu = AppMenu(sources)
  const headerLogo = HeaderLogo(sources)

  return {
    auth$: appMenu.auth$,
    route$: appMenu.route$,
    ...Toolbar({
      ...sources,
      titleDOM$: headerLogo.DOM,
      rightItemDOM$: appMenu.DOM,
    }),
  }
}

export {AppBar}
