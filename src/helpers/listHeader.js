import {h} from 'cycle-snabbdom'
import {Col} from 'snabbdom-material'
import {icon} from 'helpers'

const style = clickable => ({
  'line-height': '64px',
  backgroundColor: '#666',
  color: '#FFF',
  textTransform: 'uppercase',
  fontSize: '1.4em',
  fontWeight: 'bold',
  display: 'block',
  cursor: clickable ? 'pointer' : '',
})

export default ({title, className, iconName, clickable}) =>
  h('div.row.' + className, {style: style(clickable)}, [
    Col({type: 'xs-10'},[title]),
    iconName ?
      Col(
        {type: 'xs-1', style: {width: '48px', 'font-size': '32px'}},
        [icon(iconName, 'white')]
      ) : null,
  ])
  // h('div.row', {}, [h('div.row.' + className, {style}, [
  //   Col({type: 'xs-10'},[title]),
  //   iconName ?
  //     Col(
  //       {type: 'xs-1', style: {width: '48px', 'font-size': '32px'}},
  //       [icon(iconName, 'white')]
  //     ) : null,
  // ])])
  // h('div.row.' + className, {style}, [
  //   Col({type: 'xs-10'},[title]),
  //   iconName ?
  //     Col(
  //       {type: 'xs-1', style: {width: '48px', 'font-size': '32px'}},
  //       [icon(iconName, 'white')]
  //     ) : null,
  // ])
