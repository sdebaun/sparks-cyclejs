import {h,div,br,span} from 'cycle-snabbdom'
import {Col} from 'snabbdom-material'
import {icon} from 'helpers'

import {Menu} from 'snabbdom-material'
const Item = Menu.Item

require('./style.scss')

const fadeInOut = {
  opacity: 0,
  transition: 'opacity 100',
  delayed: {
    opacity: 1,
  },
  remove: {
    opacity: 0,
  },
}

const style = {
  lineHeight: '64px',
  cursor: 'pointer',
  ...fadeInOut,
}

const contentStyle = (lines,hasIcon) => {
  return {
    padding: '16px ' + (hasIcon ? '0px' : '16px'),
    lineHeight: lines > 1 ? '16px' : '32px',
  }
}

const iconCellStyle = {
  width: '64px',
  'font-size': '32px',
}

const titleStyle = {
  fontSize: '1.2em',
}

const subtitleStyle = {
  color: '#666',
}

export default ({iconName, title, subtitle, className, link, key, iconBackgroundColor}) =>
  h('div.row.list-item.' + className, {style, attrs: {'data-link': link, 'data-key': key}}, [
    iconName ?
      Col(
        {type: 'xs-1', style: iconCellStyle},
        [icon(iconName, 'black', iconBackgroundColor)]
      ) : null,
    Col({type: 'xs-8', style: contentStyle(subtitle ? 2 : 1, !!iconName)},[
      div({style: titleStyle},[title]),
      div({style: subtitleStyle},[subtitle]),
    ]),
  ])
