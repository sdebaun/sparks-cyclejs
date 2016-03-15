import {h, div} from 'cycle-snabbdom'
import {Menu, Button} from 'snabbdom-material'
const {Separator} = Menu
import {menu} from './menu'

import menuItem from 'helpers/menuItem'

// the goal of these kinds of functions
// is to abstract away the details of dom-specific representation
// and express that as reusable interface metaphors

const svgDropDownIcon =
  h('svg', {
    attrs: {
      fill: 'white',
      height: 16,
      viewBox: '0 0 16 16',
      width: 16,
    },
  }, [
    h('path', {attrs: {d: 'M7 10l5 5 5-5z'}}),
    h('path', {attrs: {d: 'M0 0h24v24H0z', fill: 'none'}}),
  ])

const _menuItems = items =>
  items.map(({className, label, key, link, divider}) =>
    divider ? Separator({}) : menuItem({className, title: label, key, link})
  )
  // items.map(({className, label, divider}) =>
  //   divider ? Separator({}) : Item({className}, label)
  // )

export default ({isOpen, className, label, menu: {rightAlign}, items}) =>
  div({},[
    Button(
      {className, flat: true, onClick: true,
        style: {color: 'white', margin: 0, paddingLeft: '0.5em'},
      },
      [label, svgDropDownIcon]
    ),
    menu({isOpen, rightAlign}, _menuItems(items)),
  ])
