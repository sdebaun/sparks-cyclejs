import {Observable} from 'rx';
import {svg, div, img, h} from 'cycle-snabbdom';

import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import { Appbar, Button, Icon } from 'snabbdom-material'
import Tabs from 'components/Tabs/index'

// const icon = name=>h('i',{class:{'material-icons':true}},name)
const icon = name=>Icon({name})

const IconMenu = icon('menu')

const page = sources => {

  return {
    DOM: Observable.just(
        div([
          // Appbar({fixed:true,style:{height:'48px',lineHeight:'24px'}},[
          Appbar({fixed:true},[
            Appbar.Button({onClick:()=>0}, [icon('menu')] ),
            Appbar.Title({style:{float:'left'}},'Title'),
            Appbar.Button({onClick:()=>0,style:{float:'right'}}, [icon('menu')] )
            ]),
          Tabs({},[
            h('input',{attrs:{type:'radio',name:'tabs',id:'t1',onClick:(e)=>e.target.checked=true}}),
            div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':'t1'}},'tab1')]),
            h('input',{attrs:{type:'radio',name:'tabs',id:'t2',onClick:(e)=>e.target.checked=true}}),
            div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':'t2'}},'tab2')]),
            h('input',{attrs:{type:'radio',name:'tabs',id:'t3'}}),
            div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':'t3'}},'tab3')]),
            h('input',{attrs:{type:'radio',name:'tabs',id:'t4'}}),
            div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':'t4'}},'tab4')]),
            div({class:{'slide':true}},'')

            // Tabs.Tab({},'Tab1'),
            // Tabs.Tab({},'Tab2'),
            ]),
          // h('svg',{class:{icon:true,'icon-menu':true}}, [h('use',{attrs:{'xlink:href':'#icon-menu'}},'')]),
          icon('trophy'), IconMenu,
        ])
      )
  }
}

export default sources =>{
  return {
    DOM: page(sources).DOM
  };
}