import {div} from 'cycle-snabbdom'

export const mobileFrame = ({sideNav, appBar, header, page}) =>
  div({class: {frame: true}}, [
    sideNav, appBar, header, div({}, [page]),
  ])

const navlessStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  flex: '1 1 auto',
  flexFlow: 'column',
  // display: 'flex',
}

const withSidenav = (sideNav, header, page) =>
  div({style: {display: 'flex', flex: '1 1 auto'}}, [
    sideNav ? div({style: {width: '300px'}}, [sideNav]) : null,
    div({style: {flex: '1 1 auto', display: 'flex', flexFlow: 'column'}}, [
      header,
      div({class: {cardcontainer: true}, style: {padding: '1em 1em'}}, [page]),
    ]),
  ])

const noSidenav = (header, page) =>
  div({style: navlessStyle}, [
    header,
    div({class: {cardcontainer: true}, style: {padding: '1em 1em'}}, [page]),
  ])

export const desktopFrame = ({sideNav, appBar, header, page}) =>
  div({}, [
    appBar,
    sideNav ? withSidenav(sideNav,header,page) : noSidenav(header,page),
  ])
