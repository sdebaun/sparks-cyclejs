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
}

const withSidenav = (sideNav, header, page) =>
  div({style: {display: 'flex', flex: '1 1 100%'}}, [
    sideNav ? div({style: {width: '300px'}}, [sideNav]) : null,
    div({style: {flex: '1 1 auto', display: 'flex', flexFlow: 'column'}}, [
      header,
      div('.fullpage', [page]),
    ]),
  ])

const noSidenav = (header, page) =>
  div({style: {display: 'flex', flex: '1 1 100%'}}, [
    div({style: {flex: '1 1 auto'}},['']),
    div({style: {flex: '1 1 800px', display: 'flex', flexFlow: 'column'}}, [
      header,
      div('.fullpage', [page]),
    ]),
    div({style: {flex: '1 1 auto'}},['']),
  ])
  // div({style: navlessStyle}, [
  // div({style: {flex: '1 1 100%', display: 'flex', flexFlow: 'column', alignItems: 'stretch'}}, [
  //   header,
  //   div('.fullpage', [page]),
  // ])

export const desktopFrame = ({sideNav, appBar, header, page}) =>
  div({}, [
    appBar,
    sideNav ? withSidenav(sideNav,header,page) : noSidenav(header,page),
  ])
