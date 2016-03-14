import {div} from 'cycle-snabbdom'

export const mobileFrame = ({sideNav, appBar, header, page}) =>
  div({}, [sideNav, appBar, header, div({style: {padding: '0em 1em'}}, [page])])

const navlessStyle = {
  maxWidth: '1024px',
  margin: 'auto',
}

const withSidenav = (sideNav, header, page) =>
  div({style: {display: 'flex'}}, [
    sideNav ? div({style: {width: '300px'}}, [sideNav]) : null,
    div({style: {flex: 1}}, [
      header,
      div({style: {padding: '0em 1em'}}, [page]),
    ]),
  ])

const noSidenav = (header, page) =>
  div({style: navlessStyle}, [
    header,
    div({style: {padding: '0em 1em'}}, [page]),
  ])

export const desktopFrame = ({sideNav, appBar, header, page}) =>
  div({}, [
    appBar,
    sideNav ? withSidenav(sideNav,header,page) : noSidenav(header,page),
  ])
