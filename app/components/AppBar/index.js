import {BehaviorSubject, Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'

import {icon, material} from 'helpers/dom'

import AppMenu from 'components/AppMenu'
import HeaderLogo from 'components/HeaderLogo'

const DOMx = state$ =>
  state$.map(({isMobile, appMenuDOM}) =>
    Appbar({fixed: true, material},[
      isMobile &&
        Appbar.Button({className: 'nav-button'}, [icon('menu')]),
      Appbar.Title({style: {float: 'left'}},[HeaderLogo().DOM]),
      div({style: {float: 'right'}},[appMenuDOM]),
    ]),
  )

export default sources => {
  const appMenu = AppMenu(sources) // will need to pass auth

  const navButton$ = sources.DOM.select('.nav-button').events('click')

  const state$ = combineLatestObj({
    isMobile$: sources.isMobile$,
    appMenuDOM$: appMenu.DOM,
  })

  return {
    DOM: DOMx(state$),
    auth$: appMenu.auth$,
    navButton$,
  }
}
