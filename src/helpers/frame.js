import {div} from 'cycle-snabbdom'

export const mobileFrame = ({sideNav, appBar, header, page}) =>
  div({}, [sideNav, appBar, header, page])

export const desktopFrame = ({sideNav, appBar, header, page}) =>
  div({}, [
    appBar,
    div({style: {display: 'flex'}},[
      div({style: {width: '300px'}}, [sideNav]),
      div({style: {flex: 1}}, [
        header,
        div({style: {padding: '0em 1em'}}, [page]),
      ]),
    ]),
  ])
