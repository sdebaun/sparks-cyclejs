import {BehaviorSubject, Observable} from 'rx'
import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'

import {icon, material} from 'helpers/dom'

import AppMenu from 'components/AppMenu'
import HeaderLogo from 'components/HeaderLogo'

export default ({DOM, auth$, isMobile$}) => {
  const appMenu = AppMenu({DOM,auth$}) // will need to pass auth

  const buttonClick$ = DOM.select('.menu-button').events('click')

  const openSidNav$ = buttonClick$.map(() => true)

  return {
    DOM: isMobile$.map(isMobile =>
      Appbar({fixed: true, material},[
        isMobile &&
          Appbar.Button({className: 'menu-button'}, [icon('menu')]),
        Appbar.Title({style: {float: 'left'}},[HeaderLogo().DOM]),
        div({style: {float: 'right'}},[appMenu.DOM]),
      ]),
    ),
    auth$: appMenu.auth$,
    openSidNav$,
  }
}
