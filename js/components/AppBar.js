import {BehaviorSubject, Observable} from 'rx'
import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'

import {icon, material} from 'helpers/dom'

import AppMenu from 'components/AppMenu'
import HeaderLogo from 'components/HeaderLogo'

export default ({DOM, auth$, isMobile$, sidenavToggle$}) => {
  const appMenu = AppMenu({DOM,auth$}) // will need to pass auth

  return {
    DOM: isMobile$.map(isMobile =>
      Appbar({fixed: true, material},[
        isMobile &&
          Appbar.Button({
            onClick: () => sidenavToggle$.onNext(true),
          }, [icon('menu')]),
        Appbar.Title({style: {float: 'left'}},[HeaderLogo().DOM]),
        div({style: {float: 'right'}},[appMenu.DOM]),
      ]),
    ),
    auth$: appMenu.auth$,
  }
}
