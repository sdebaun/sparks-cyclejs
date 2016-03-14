import {h,div,br,span} from 'cycle-snabbdom'
import {Col} from 'snabbdom-material'
import {icon} from 'helpers'

import {Menu} from 'snabbdom-material'
const Item = Menu.Item

const style = {
  lineHeight: '64px',
  color: '#666',
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

export default ({iconName, title, subtitle = 'Coming Soon!', className, link, iconBackgroundColor}) =>
  h('div.row.' + className, {style, attrs: {'data-link': link}}, [
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
