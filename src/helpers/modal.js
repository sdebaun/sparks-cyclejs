import {div, span} from 'cycle-snabbdom'
import {Col, Mask} from 'snabbdom-material'
import {material} from 'util'
import {icon} from 'helpers'

import {Dialog} from 'snabbdom-material'

const dialogStyle = {
  minWidth: '400px',
}

const titleStyle = {
  color: '#FFF',
  backgroundColor: '#F00',
  lineHeight: '64px',
  height: '64px',
}

const contentStyle = {
  padding: '0em 1em 1em 1em',
}

const titleRow = (iconName, title) =>
  div({style: titleStyle}, [
    Col(
      {type: 'xs-1', style: {width: '48px', 'font-size': '32px'}},
      [icon(iconName)]
    ),
    Col({type: 'xs-8'},[title]),
  ])

const modal = ({title, iconName, content, submitLabel, closeLabel}) =>
  Dialog({
    isOpen: true,
    noPadding: true,
    style: dialogStyle,
    title: titleRow(iconName, title),
    footer: span({},[
      Dialog.Button(
        {onClick: true, primary: true, className: 'submit'},[submitLabel]
      ),
      Dialog.Button(
        {onClick: true, flat: true, className: 'close'},[closeLabel]
      ),
    ]),
  },[
    div({style: contentStyle}, [content]),
  ])

  // div({},[
  //   Mask({isOpen: true, material, className: 'close'}),
  //   dialog(props),
  // ])

export default ({isOpen, ...props}) =>
  isOpen && modal(props) || null

