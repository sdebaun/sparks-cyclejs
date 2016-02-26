import {BehaviorSubject,Observable} from 'rx';
import {div} from 'cycle-snabbdom';

import 'normalize-css'
import '!style!css!snabbdom-material/lib/index.css'

import { Appbar, Button, Menu } from 'snabbdom-material'
import Tabs from 'components/Tabs'
import AppMenu from 'components/AppMenu'
import AppBar from 'components/AppBar'

import { icon } from 'helpers/dom'

export default sources =>{
  const appBar = AppBar(sources) // will need to pass auth

  return {
    DOM: Observable.just(
      div([
        appBar.DOM,
        Tabs({},[
          Tabs.Tab({id:'t1'},'t1'),
          Tabs.Tab({id:'t2'},'t2'),
          Tabs.Tab({id:'t3'},'t3'),
          Tabs.Tab({id:'t4'},'t4'),
        ]),
      ])
    )
  }
}
