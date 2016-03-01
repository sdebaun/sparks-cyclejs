import {div} from 'cycle-snabbdom'
import {Sidenav, Col, Row} from 'snabbdom-material'

export const mobileLayout = ({bar,side,tabs,main,isOpen,onClose}) =>
  div([
    Sidenav({className: 'sideNav', isOpen, onClose},side),
    bar, tabs, main,
  ])

export const desktopLayout = ({bar,side,tabs,main}) =>
  div([
    bar,
    Row({},[
      Col({type: 'xs-3'}, side),
      Col({type: 'xs-9'}, [tabs, main]),
    ]),
  ])
