import {div} from 'cycle-snabbdom'
import {Appbar, Menu} from 'snabbdom-material'
const {Item, Separator} = Menu
import {icon} from './index'
import {menu} from './menu'

const _menuItems = items =>
  items.map(({className, label, divider}) =>
    divider ? Separator({}) : Item({className}, label)
  )

export default ({isOpen, className, iconName, menu: {rightAlign}, items}) =>
  div({},[
    Appbar.Button({className}, [icon(iconName)]),
    menu({isOpen, rightAlign}, _menuItems(items)),
  ])
