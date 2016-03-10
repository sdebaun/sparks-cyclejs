import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import AppMenu from 'components/AppMenu'

import {appBar} from 'helpers'

export default sources => {
  const appMenu = AppMenu(sources)
  const DOM = combineLatestObj({
    appMenu: appMenu.DOM,
  }).map(appBar)

  return {
    DOM,
    auth$: appMenu.auth$,
    route$: appMenu.route$,
  }
}
