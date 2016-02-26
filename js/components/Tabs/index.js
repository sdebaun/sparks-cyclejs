import {div,h} from 'cycle-snabbdom';

import defaultMaterial from 'snabbdom-material/lib/components/defaultMaterial'

import './styles.scss'

const Tabs = ({
  material = defaultMaterial
},children)=>
  children && div( {class:{'tab-wrap':true}, style:{
      'background-color': material.primaryColor
    }},
      children.reduce((a,b)=>a.concat(b)).concat([div({class:{'slide':true}},'')])
  )

const Tab = ({id},children)=>([
  h('input',{attrs:{type:'radio',name:'tabs',id}}),
  div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':id}},children)]),
])

Tabs.Tab = Tab

export default Tabs