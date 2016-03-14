import {h,div,br,span} from 'cycle-snabbdom'
import {Col} from 'snabbdom-material'
import {icon} from 'helpers'

import './styles.scss'

const contentStyle = (lines,padLeft) => {
  return {
    padding: '16px ' + (padLeft ? '0px' : '16px'),
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

const classNames = (className, clickable, disabled, header) =>
  ['row', 'list-item', className,
    clickable && 'clickable',
    disabled && 'disabled',
    header && 'header',
  ].filter(x => !!x)

const iconCell = (iconName, iconBackgroundColor) =>
  Col(
    {type: 'xs-1', style: iconCellStyle},
    [icon(iconName, 'black', iconBackgroundColor)]
  )

const contentCell = (title, subtitle, padLeft) =>
  Col({type: 'xs-9', style: contentStyle(subtitle ? 2 : 1, padLeft)},[
    div({style: titleStyle},[title]),
    div({style: subtitleStyle},[subtitle]),
  ])

const iconFirst = (ic,cc) => [ic,cc]
const iconLast = (ic,cc) => [cc,ic]

export default ({iconName, header, clickable, disabled, title, subtitle, className, link, key, iconBackgroundColor}) =>
  h('div.' + classNames(className, clickable || link || key, disabled, header).join('.'), {
    attrs: {'data-link': link, 'data-key': key},
  }, (header ? iconLast : iconFirst)(
      !!iconName && iconCell(iconName,iconBackgroundColor),
      contentCell(title, subtitle, !!iconName && !header)
    )
  )

