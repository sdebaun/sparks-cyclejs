import {Observable} from 'rx'
const {just, merge} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {col, div} from 'helpers'
import listItem from 'helpers/listItem'
import menuItem from 'helpers/menuItem'
import {DropdownMenu} from 'components/DropdownMenu'

import {Form, makeMenuItemFormPopup} from 'components/ui'
import makeInputControl from 'components/InputControlFactory'

import {log} from 'util'

// const _openActions$ = ({DOM}) => Observable.merge(
//   DOM.select('.clickable').events('click').map(() => true),
// )

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

// const deposit =
//   menuItem({
//     iconName: 'ticket',
//     title: 'A refundable deposit',
//     className: 'give.deposit',
//   })

const _render = ({dropdownDOM, giveWaiverModalDOM, giveDepositModalDOM}) =>
  col(
    listItem({
      iconName: 'plus',
      title: 'What do Volunteers GIVE?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    dropdownDOM,
    giveWaiverModalDOM,
    giveDepositModalDOM,
  )

const WhoInput = makeInputControl({
  label: 'Who is being helped?',
  className: 'help',
})

const GiveWaiverForm = sources => {
  const Controls$ = just([
    {field: 'who', Control: WhoInput},
  ])

  return Form({...sources, Controls$})
}

const DepositAmountInput = makeInputControl({
  label: 'How much is their Deposit?',
  className: 'deposit',
})

const GiveDepositForm = sources => {
  const Controls$ = just([
    {field: 'amount', Control: DepositAmountInput},
  ])

  return Form({...sources, Controls$})
}

const GiveWaiver = makeMenuItemFormPopup({
  FormControl: GiveWaiverForm,
  title: 'A Liability Waiver',
  iconName: 'event_available',
  className: 'waiver',
})

const GiveDeposit = makeMenuItemFormPopup({
  FormControl: GiveDepositForm,
  title: 'A refundable deposit',
  iconName: 'ticket',
  className: 'give.deposit',
})

export const AddCommitmentGive = sources => {
  const giveWaiver = GiveWaiver(sources)
  const giveDeposit = GiveDeposit(sources)

  const children$ = just([div({},[
    giveWaiver.itemDOM,
    shifts,
    payment,
    giveDeposit.itemDOM,
  ])])

  const isOpen$ = sources.DOM.select('.clickable').events('click')
    .map(true)
    .merge(giveWaiver.submit$.map(false))
    .merge(giveDeposit.submit$.map(false))
    .startWith(false)

  const dropdown = DropdownMenu({...sources, isOpen$, children$})

  const viewState = {
    dropdownDOM$: dropdown.DOM,
    giveWaiverModalDOM$: giveWaiver.modalDOM,
    giveDepositModalDOM$: giveDeposit.modalDOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  const commitment$ = merge(
    giveWaiver.item$.map(c => ({...c, code: 'waiver'})),
    giveDeposit.item$.map(c => ({...c, code: 'deposit'})),
  ).map(c => ({...c, party: 'vol'}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
