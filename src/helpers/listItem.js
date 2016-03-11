import {h,div,br,span} from 'cycle-snabbdom'
import {Col} from 'snabbdom-material'
import {icon} from 'helpers'

const style = {
  lineHeight: '64px',
}

const contentStyleTwoLine = {
  lineHeight: '16px',
  padding: '16px 0px',
}

const contentStyleOneLine = {
  lineHeight: '32px',
  padding: '16px 0px',
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

export default ({iconName, title, subtitle, className, link}) =>
  h('div.row.' + className, {style, attrs: {'data-link': link}}, [
    iconName ?
      Col(
        {type: 'xs-1', style: iconCellStyle},
        [icon(iconName, 'black')]
      ) : null,
    Col({type: 'xs-8', style: subtitle ? contentStyleTwoLine : contentStyleOneLine},[
      div({style: titleStyle},[title]),
      div({style: subtitleStyle},[subtitle]),
    ]),
  ])
