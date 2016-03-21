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

const waiver =
  menuItem({
    iconName: 'calendar-check-o',
    title: 'A signed liability waiver',
    iconBackgroundColor: 'red',
    className: 'give.waiver',
  })

const shifts =
  menuItem({
    iconName: 'calendar2',
    title: 'One or more shifts',
    className: 'give.shifts',
  })

const payment =
  menuItem({
    iconName: 'banknote',
    title: 'A payment',
    className: 'give.payment',
  })

const deposit =
  menuItem({
    iconName: 'ticket',
    title: 'A refundable deposit',
    className: 'give.deposit',
  })

const _render = ({dropdownDOM}) =>
  col(
    listItem({
      iconName: 'plus',
      title: 'What do Volunteers GIVE?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    dropdownDOM,
  )

// const AddDepositItem = sources => {

//   return {
//     DOM,
//     queue$,
//   }
// }

export const AddCommitmentGive = sources => {
  const isOpen$ = _openActions$(sources).startWith(false)

  // const addDeposit = AddDepositItem(sources)

  const children$ = just([div({},[
    waiver,
    shifts,
    payment,
    deposit,
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
