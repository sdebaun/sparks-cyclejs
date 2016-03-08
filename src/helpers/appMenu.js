import {div} from 'cycle-snabbdom'
import {Appbar, Menu} from 'snabbdom-material'
const {Item} = Menu
import {icon} from './index'
import {menu} from './menu'

function appMenu({isOpen,auth,userProfile}) {
  return div({}, [
    Appbar.Button({className: 'app-menu-button'}, [
      icon('more_vert'),
    ]),
    menu({isOpen, rightAlign: true}, [
      userProfile ? Item({className: 'home'}, userProfile.fullName) : null,
      userProfile && userProfile.isAdmin ?
        Item({className: 'admin'},'Admin') :
        null,
      auth ? null : Item({className: 'login facebook'},'Facebook'),
      auth ? null : Item({className: 'login google'},'Google'),
      auth ? Item({className: 'logout'},'Logout') : null,
    ]),
  ])
}

export {appMenu}
