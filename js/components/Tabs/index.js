import {div,h} from 'cycle-snabbdom';

import defaultMaterial from 'snabbdom-material/lib/components/defaultMaterial'

import './styles.scss'

const Tabs = ({
  material = defaultMaterial
},children)=>
  children && div({class:{'tab-wrap':true}},children)

const Tab = (props,children)=>
  div([
    h('input',{attrs:{type:'radio',name:'tabs'}}),
    div({class:{'tab-label-content':true}},[h('label',{},children)])
  ])
  

Tabs.Tab = Tab

export default Tabs