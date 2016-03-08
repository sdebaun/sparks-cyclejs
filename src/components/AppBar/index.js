import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

// goal: get explicit snabbdom refs out of routes & components
import {div} from 'cycle-snabbdom'
import {Appbar} from 'snabbdom-material'
import {material} from 'util'

import AppMenu from 'components/AppMenu'
import HeaderLogo from 'components/HeaderLogo'

// not sure...
// const _DOM = ({appMenuDOM}) =>
//   appBar({
//     appMenu: appMenuDOM,
//     // background: or however we implement no bg color
//   })

const _DOM = ({appMenuDOM}) =>
  Appbar({fixed: true, material},[
    Appbar.Title({style: {float: 'left'}},[HeaderLogo().DOM]),
    div({style: {float: 'right'}},[appMenuDOM]),
  ])

export default sources => {
  const appMenu = AppMenu(sources) // will need to pass auth

  const DOM = combineLatestObj({
    appMenuDOM$: appMenu.DOM,
  }).map(_DOM)

  return {
    DOM,
    auth$: appMenu.auth$,
    route$: appMenu.route$,
  }
}
