import { BehaviorSubject } from 'rx'
import { Appbar, Menu } from 'snabbdom-material'
import { div } from 'cycle-snabbdom'
import { icon } from 'helpers/dom'

export default sources => {
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
