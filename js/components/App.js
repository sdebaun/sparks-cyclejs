import {BehaviorSubject,Observable} from 'rx';
import {svg, div, img, h} from 'cycle-snabbdom';

import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import { Appbar, Button, Icon, Menu } from 'snabbdom-material'
import Tabs from 'components/Tabs/index'

// const icon = name=>h('i',{class:{'material-icons':true}},name)
const icon = name=>Icon({name})

const IconMenu = icon('menu')

const AppMenu = sources => {
  const click$ = new BehaviorSubject()
  click$.subscribe(x=>console.log(x))
  const toggle = (state)=>click$.onNext(!state)

  return {
    DOM: click$.startWith(false).map( isOpen=>
      div([
        Appbar.Button({onClick:e=>toggle(isOpen)}, [icon('more_vert')]),
        Menu({isOpen,rightAlign:true,onClose:e=>toggle(isOpen)},[
          Menu.Item({onClick:e=>toggle(isOpen),onClose:e=>toggle(isOpen)},'thing1'),
          Menu.Item({onClick:e=>toggle(isOpen),onClose:e=>toggle(isOpen)},'thing2'),
        ])        
      ])
    )
  }
}
const page = sources => {
  const appMenu = AppMenu()

  return {
    DOM: Observable.just(
      div([
        Appbar({fixed:true},[
          Appbar.Button({onClick:()=>0}, [icon('menu')] ),
          Appbar.Title({style:{float:'left'}},'Title'),
          div({style:{float:'right'}},[appMenu.DOM]),
        ]),
        Tabs({},[
          h('input',{attrs:{type:'radio',name:'tabs',id:'t1'}}),
          div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':'t1'}},'tab1')]),
          h('input',{attrs:{type:'radio',name:'tabs',id:'t2'}}),
          div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':'t2'}},'tab2')]),
          h('input',{attrs:{type:'radio',name:'tabs',id:'t3'}}),
          div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':'t3'}},'tab3')]),
          h('input',{attrs:{type:'radio',name:'tabs',id:'t4'}}),
          div({class:{'tab-label-content':true}},[h('label',{attrs:{'for':'t4'}},'tab4')]),
          div({class:{'slide':true}},'')
        ]),
      ])
    )
  }
}

export default sources =>{
  return {
    DOM: page(sources).DOM
  };
}