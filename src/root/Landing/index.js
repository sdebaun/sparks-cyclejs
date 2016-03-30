import {Observable} from 'rx'
const {merge, combineLatest} = Observable

import AppMenu from 'components/AppMenu'
import {landing} from 'helpers'

import {LoginButtons} from 'components/ui'

// import {log} from 'util'

import './styles.scss'

export default (sources) => {
  const appMenu = AppMenu(sources)

  const logins = LoginButtons(sources)

  const DOM = combineLatest(
    appMenu.DOM,
    logins.DOM,
    landing
  )

  return {
    DOM,
    auth$: merge(logins.auth$, appMenu.auth$),
    route$: sources.redirectLogin$,
  }
}
