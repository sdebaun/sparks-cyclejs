import {Observable} from 'rx';
import {div} from 'cycle-snabbdom';

import { Appbar } from 'snabbdom-material'
import AppMenu from 'components/AppMenu'
import { icon } from 'helpers/dom'

export default sources =>{
  const appMenu = AppMenu() // will need to pass auth

  return {
    DOM: Observable.just(
      Appbar({fixed:true},[
        Appbar.Button({onClick:()=>0}, [icon('menu')] ),
        Appbar.Title({style:{float:'left'}},'Title'),
        div({style:{float:'right'}},[appMenu.DOM]),
      ]),
    )
  }
}
