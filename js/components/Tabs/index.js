import {div,h} from 'cycle-snabbdom';

import {material} from 'helpers/dom'

import './styles.scss'

const Tabs = (props,children)=>
  children && div( {class:{'tab-wrap':true}, style:{
      'background-color': material.primaryColor
    }},
      children.reduce((a,b)=>a.concat(b)).concat([div({class:{'slide':true}},'')])
  )

const Tab = ({id},children)=>([
  h('input',{attrs:{type:'radio',name:'tabs',id}}),
  div({class:{'tab-label-content':true}},[
    h('label',{attrs:{'for':id},style:{color:material.primaryFontColor}},children)
  ]),
])

Tabs.Tab = Tab

export default Tabs