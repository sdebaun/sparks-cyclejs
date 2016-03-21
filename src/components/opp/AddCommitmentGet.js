import {Observable} from 'rx'
const {empty, just} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {col, div} from 'helpers'
import listItem from 'helpers/listItem'
import menuItem from 'helpers/menuItem'
import {DropdownMenu} from 'components/DropdownMenu'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.clickable').events('click').map(() => true),
)

const toHelp = () =>
  menuItem({
    iconName: 'users',
    title: 'To help with __________',
  })

const ticketTo = () =>
  menuItem({
    iconName: 'ticket',
    title: 'A ticket to __________',
  })

const benefits = () =>
  menuItem({
    iconName: 'insert_invitation',
    title: 'The awesome benefits of ......',
  })

const extras = () =>
  menuItem({
    iconName: 'build',
    title: 'All these awesome extras: _________',
  })

const _render = ({dropdownDOM}) =>
  col(
    listItem({
      iconName: 'plus',
      title: 'What do Volunteers GET?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    dropdownDOM,
    // isOpen && menu({isOpen}, [
    //   toHelp(),
    //   ticketTo(),
    //   benefits(),
    //   extras(),
    // ])
  )

export const AddCommitmentGet = sources => {
  const isOpen$ = _openActions$(sources).startWith(false)

  const children$ = just([div({},[
    toHelp(),
    ticketTo(),
    benefits(),
    extras(),
  ])])

  const dropdown = DropdownMenu({...sources, isOpen$, children$})

  const viewState = {
    dropdownDOM$: dropdown.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    isOpen$,
    queue$: empty(),
  }
}
