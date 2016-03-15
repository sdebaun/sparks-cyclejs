import {h,div,br,span,img} from 'cycle-snabbdom'
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

const iconImageStyle = {
  width: '40px',
  height: '40px',
  marginTop: '12px',
  marginLeft: '-4px', // such hax
  borderRadius: '20px',
}

const iconCell = (iconName, iconSrc, iconBackgroundColor) =>
  Col(
    {type: 'xs-1', style: iconCellStyle}, [
      iconSrc ?
        img({style: iconImageStyle, attrs: {src: iconSrc}}, []) :
        icon(iconName, 'black', iconBackgroundColor),
    ]
  )

const contentCell = (title, subtitle, padLeft) =>
  Col({type: 'xs-9', style: contentStyle(subtitle ? 2 : 1, padLeft)},[
    div({style: titleStyle},[title]),
    div({style: subtitleStyle},[subtitle]),
  ])

const iconFirst = (ic,cc) => [ic,cc]
const iconLast = (ic,cc) => [cc,ic]

const isClickable = ({clickable, link, key, disabled}) =>
  (clickable || link || key) && !disabled

const _classNames = props =>
  ['row', 'list-item', props.className,
    isClickable(props) && 'clickable',
    props.disabled && 'disabled',
    props.header && 'header',
  ].filter(x => !!x)

const _render = ({
  iconName, iconSrc, iconBackgroundColor,
  header, clickable, disabled,
  title, subtitle,
  classNames, link, key,
}) =>
  h('div.' + classNames.join('.'), {
    attrs: {'data-link': link, 'data-key': key},
  }, (header ? iconLast : iconFirst)(
      (iconName || iconSrc) && iconCell(iconName, iconSrc, iconBackgroundColor),
      contentCell(title, subtitle, (!!iconName || !!iconSrc) && !header)
    )
  )

export default props =>
  _render({classNames: _classNames(props), ...props})
