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

const ShiftCountInput = makeInputControl({
  label: 'How many shifts?',
  className: 'shifts',
})

const GiveShiftForm = sources => Form({...sources,
  Controls$: just([{field: 'count', Control: ShiftCountInput}]),
})

const GiveShifts = makeMenuItemFormPopup({
  FormControl: GiveShiftForm,
  title: 'One or more Shifts',
  iconName: 'calendar2',
  className: 'shifts',
})

const PaymentAmountInput = makeInputControl({
  label: 'How much do they pay?',
  className: 'banknote',
})

const GivePaymentForm = sources => Form({...sources,
  Controls$: just([{field: 'count', Control: PaymentAmountInput}]),
})

const GivePayment = makeMenuItemFormPopup({
  FormControl: GivePaymentForm,
  title: 'A Payment',
  iconName: 'event_available',
  className: 'payment',
})

const LegalNameInput = makeInputControl({
  label: 'What is the Legal Name of your Organization?',
  className: 'legal-name',
})

const GiveWaiverForm = sources => {
  const Controls$ = just([
    {field: 'who', Control: LegalNameInput},
  ])

  return Form({...sources, Controls$})
}

const GiveWaiver = makeMenuItemFormPopup({
  FormControl: GiveWaiverForm,
  title: 'A Liability Waiver',
  iconName: 'event_available',
  className: 'waiver',
})

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

const GiveDeposit = makeMenuItemFormPopup({
  FormControl: GiveDepositForm,
  title: 'A refundable deposit',
  iconName: 'ticket',
  className: 'give.deposit',
})

const _render = ({dropdownDOM, modalDOMs}) =>
  div({},[
    listItem({
      iconName: 'plus',
      title: 'What do Volunteers GIVE?',
      iconBackgroundColor: 'yellow',
      clickable: true,
    }),
    dropdownDOM,
    ...modalDOMs,
  ])

export const AddCommitmentGive = sources => {
  const giveWaiver = GiveWaiver(sources)
  const giveDeposit = GiveDeposit(sources)
  const givePayment = GivePayment(sources)
  const giveShifts = GiveShifts(sources)

  const menuItemDOMs$ = just([div({},[
    giveWaiver.itemDOM,
    giveShifts.itemDOM,
    givePayment.itemDOM,
    giveDeposit.itemDOM,
  ])])

  const modalDOMs$ = just([
    giveWaiver.modalDOM,
    giveDeposit.modalDOM,
    givePayment.modalDOM,
    giveShifts.modalDOM,
  ])

  const isOpen$ = sources.DOM.select('.clickable').events('click')
    .map(true)
    .merge(giveWaiver.submit$.map(false))
    .merge(giveDeposit.submit$.map(false))
    .merge(givePayment.submit$.map(false))
    .merge(giveShifts.submit$.map(false))
    .startWith(false)

  const dropdown = DropdownMenu({...sources, isOpen$, children$: menuItemDOMs$})

  const viewState = {
    dropdownDOM$: dropdown.DOM,
    modalDOMs$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  const commitment$ = merge(
    giveWaiver.item$.map(c => ({...c, code: 'waiver'})),
    giveDeposit.item$.map(c => ({...c, code: 'deposit'})),
    givePayment.item$.map(c => ({...c, code: 'payment'})),
    giveShifts.item$.map(c => ({...c, code: 'shifts'})),
  ).map(c => ({...c, party: 'vol'}))

  return {
    DOM,
    isOpen$,
    commitment$,
  }
}
