import {h} from 'cycle-snabbdom'
import {Col} from 'snabbdom-material'
import {icon} from 'helpers'

export default ({iconName, title, subtitle, className}) =>
  h('div.row.' + className, {style: {'line-height': '64px'}}, [
    iconName ?
      Col(
        {type: 'xs-1', style: {width: '48px', 'font-size': '32px'}},
        [icon(iconName, 'black')]
      ) : null,
    Col({type: 'xs-8'},[title, subtitle]),
  ])
