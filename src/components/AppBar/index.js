import {BehaviorSubject, Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'cycle-snabbdom'

import {Appbar} from 'snabbdom-material'

import {icon} from 'helpers'
import {material} from 'util'

import AppMenu from 'components/AppMenu'
import HeaderLogo from 'components/HeaderLogo'

const _DOM = ({isMobile, appMenuDOM, hideMenu}) =>
  Appbar({fixed: true, material},[
    Appbar.Title({style: {float: 'left'}},[HeaderLogo().DOM]),
    div({style: {float: 'right'}},[appMenuDOM]),
  ])

export default sources => {
  const appMenu = AppMenu(sources) // will need to pass auth

  const navButton$ = sources.DOM.select('.nav-button').events('click')

  const DOM = combineLatestObj({
    isMobile$: sources.isMobile$,
    appMenuDOM$: appMenu.DOM,
    hideMenu: sources.hideMenu$ || Observable.just(false),
  }).map(_DOM)

  return {
    DOM,
    auth$: appMenu.auth$,
    route$: appMenu.route$,
    navButton$,
  }
}
