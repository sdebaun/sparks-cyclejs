import {div} from 'cycle-snabbdom'
import {Appbar, Menu} from 'snabbdom-material'
const {Item, Separator} = Menu
import {icon} from './index'
import {menu} from './menu'

// the goal of these kinds of functions
// is to abstract away the details of dom-specific representation
// and express that as reusable interface metaphors

const _menuItems = items =>
  items.map(({className, label, divider}) =>
    divider ? Separator({}) : Item({className}, label)
  )

// there shouldn't be anything passed to this that is DOM-specific
// exception for className:
// because its used to select event streams from DOM driver
// conceptually its something like 'actionTag'
// but there is no purpose in deliberately obfuscating that :)
export default ({isOpen, className, iconName, menu: {rightAlign}, items}) =>
  div({},[
    Appbar.Button({className}, [icon(iconName)]),
    menu({isOpen, rightAlign}, _menuItems(items)),
  ])
