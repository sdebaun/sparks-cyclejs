import {Observable} from 'rx'
const {just, merge} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'
import listItem from 'helpers/listItem'
import {DropdownMenu} from 'components/DropdownMenu'

import {Form, makeMenuItemFormPopup} from 'components/ui'
import makeInputControl from 'components/InputControlFactory'

// import {log} from 'util'

import codeIcons from 'components/opp/codeIcons'

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
  iconName: codeIcons['shifts'],
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
  iconName: codeIcons['payment'],
  className: 'payment',
})

const LegalNameInput = makeInputControl({
  label: 'What is the Legal Name of your Organization?',
  className: 'legal-name',
})

const GiveWaiverForm = sources => Form({...sources,
  Controls$: just([{field: 'count', Control: LegalNameInput}]),
})

const GiveWaiver = makeMenuItemFormPopup({
  FormControl: GiveWaiverForm,
  title: 'A Liability Waiver',
  iconName: codeIcons['waiver'],
  className: 'waiver',
})

const DepositAmountInput = makeInputControl({
  label: 'How much is their Deposit?',
  className: 'deposit',
})

const GiveDepositForm = sources => Form({...sources,
  Controls$: just([{field: 'count', Control: DepositAmountInput}]),
})

const GiveDeposit = makeMenuItemFormPopup({
  FormControl: GiveDepositForm,
  title: 'A refundable deposit',
  iconName: codeIcons['deposit'],
  className: 'deposit',
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

  const children = [
    giveWaiver,
    giveShifts,
    givePayment,
    giveDeposit,
  ]

  const menuItemDOMs$ = just([div({},
    children.map(c => c.itemDOM)
  )])

  const modalDOMs$ = just(
    children.map(c => c.modalDOM)
  )

  const submits$ = merge(...children.map(c => c.submit$))

  const isOpen$ = sources.DOM.select('.clickable').events('click')
    .map(true)
    .merge(submits$.map(false))
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
