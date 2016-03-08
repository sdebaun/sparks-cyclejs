import {div} from 'cycle-snabbdom'
import {Col, Row} from 'snabbdom-material'
import {sideNav} from 'helpers/layout/sideNav'

export const mobileLayout = ({bar, side, tabs, main, isOpen}) =>
  div([
    sideNav({className: 'sideNav', isOpen}, [side]),
    bar, tabs, main,
  ])

export const desktopLayout = ({bar,side,tabs,main}) =>
  div([
    bar,
    Row({},[
      Col({type: 'xs-3'}, [side]),
      Col({type: 'xs-9'}, [tabs, main]),
    ]),
  ])

export const layoutDOM = ({
  pageDOM, appBarDOM, tabBarDOM, navContentDOM, isMobile, isOpen,
}) =>
  (isMobile ? mobileLayout : desktopLayout)({
    bar: appBarDOM,
    tabs: tabBarDOM,
    side: navContentDOM,
    main: pageDOM,
    isOpen,
  })
