import combineLatestObj from 'rx-combine-latest-obj'

import AppMenu from 'components/AppMenu'
import {landing} from 'helpers'

// import {RaisedButton} from 'components/cyclic-surface-material'
import {LoginButtons} from 'components/ui'

// import {log} from 'util'

import './styles.scss'

export default (sources) => {
  const appMenu = AppMenu(sources)

  const logins = LoginButtons(sources)

  const viewState = {
    appMenuDOM$: appMenu.DOM,
    googleLoginDOM$: logins.DOM,
  }

  const DOM = combineLatestObj(viewState)
    .map(({appMenuDOM, googleLoginDOM}) =>
      landing(appMenuDOM, googleLoginDOM)
    )

  return {
    DOM,
    auth$: logins.auth$,
    route$: sources.redirectLogin$,
  }
}
