import {div,h} from 'cycle-snabbdom'

import {icon} from 'helpers'
import {material} from 'util'

import './styles.scss'

const tabs = (props,children) =>
  children && div({class: {'tab-wrap': true}, style: {
    'background-color': material.primaryColor,
  }},
    children.reduce((a,b) => a.concat(b))
      .concat([div({class: {slide: true}},'')])
  )

const tab = ({id, link},children) => [
  h('input',{attrs: {type: 'radio', name: 'tabs', id}}),
  div({class: {'tab-label-content': true}, attrs: {'data-link': link}},[
    h('label',{attrs: {for: id}, style: {
      color: material.primaryFontColor},
    },children),
  ]),
]

export default tabs
export {tab}
