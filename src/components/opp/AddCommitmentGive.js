// TODO: convert makeMenuItemFormPopup

import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable
import combineLatestObj from 'rx-combine-latest-obj'

import {div} from 'helpers'
import listItem from 'helpers/listItem'
import {Menu} from 'components/sdm'

import {Form, makeMenuItemFormPopup} from 'components/ui'
import {
  InputControl,
  ListItemClickable,
} from 'components/sdm'

// import {log} from 'util'

import codeIcons from 'components/opp/codeIcons'

const ShiftCountInput = sources => InputControl({
  ...sources,
  label$: just('How many shifts?'),
  value$: just(1),
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

const PaymentAmountInput = sources => InputControl({
  ...sources,
  label$: just('How much do they pay?'),
})

const GivePaymentForm = sources => Form({...sources,
  Controls$: just([{field: 'amount', Control: PaymentAmountInput}]),
})

const GivePayment = makeMenuItemFormPopup({
  FormControl: GivePaymentForm,
  title: 'A Payment',
  iconName: codeIcons['payment'],
  className: 'payment',
})

const LegalNameInput = sources => InputControl({
  ...sources,
  label$: just('What is the Legal Name of your Organization?'),
})

const GiveWaiverForm = sources => Form({...sources,
  Controls$: just([{field: 'who', Control: LegalNameInput}]),
})

const GiveWaiver = makeMenuItemFormPopup({
  FormControl: GiveWaiverForm,
  title: 'A Liability Waiver',
  iconName: codeIcons['waiver'],
  className: 'waiver',
})

const DepositAmountInput = sources => InputControl({
  ...sources,
  label$: just('How much is their Deposit?'),
})

const GiveDepositForm = sources => Form({...sources,
  Controls$: just([{field: 'amount', Control: DepositAmountInput}]),
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

const SelectingItem = sources => ListItemClickable({...sources,
  title$: just('What do Volunteers GET?'),
  iconName$: just('plus'),
})

export const AddCommitmentGive = sources => {
  const selecting = SelectingItem(sources)
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

  const dropdown = Menu({...sources, isOpen$, children$: menuItemDOMs$})

  const DOM = combineLatest(
    modalDOMs$,
    selecting.DOM,
    dropdown.DOM,
    (modals, ...rest) => div({},[...rest, ...modals])
  )

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
