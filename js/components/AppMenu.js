import {BehaviorSubject} from 'rx'
import {Appbar, Menu} from 'snabbdom-material'
import {div} from 'cycle-snabbdom'
import {icon} from 'helpers/dom'

const {Item} = Menu

export default sources => {
  const click$ = new BehaviorSubject()

  const toggle = state => click$.onNext(!state)

  return {
    DOM: click$.startWith(false).map(isOpen =>
      div([
        Appbar.Button({onClick: e => toggle(isOpen)}, [icon('more_vert')]),
        Menu({isOpen, rightAlign: true, onClose: e => toggle(isOpen)},[
          Item({
            onClick: e => toggle(isOpen),onClose: e => toggle(isOpen),
          },'thing1'),
          Item({
            onClick: e => toggle(isOpen),onClose: e => toggle(isOpen),
          },'thing2'),
        ]),
      ])
    ),
  }
}
