import {Observable} from 'rx'
const {just} = Observable

import codeIcons from 'components/opp/codeIcons'
import {InputControl} from 'components/sdm'
import {Form, makeMenuItemFormPopup} from 'components/ui'

/* Waiver */

const LegalNameInput = sources => InputControl({
  label$: just('What is the Legal Name of your Organization?'),
  ...sources,
})

const GiveWaiverForm = sources => Form({...sources,
  Controls$: just([{field: 'who', Control: LegalNameInput}]),
})

export {GiveWaiverForm}

const GiveWaiver = makeMenuItemFormPopup({
  FormControl: GiveWaiverForm,
  title: 'A Liability Waiver',
  iconName: codeIcons['waiver'],
  className: 'waiver',
})

export {GiveWaiver}

/* end waiver */

/* shifts */

const ShiftCountInput = sources => InputControl({
  label$: just('How many shifts?'),
  value$: just(1),
  ...sources,
})

const GiveShiftForm = sources => Form({...sources,
  Controls$: just([{field: 'count', Control: ShiftCountInput}]),
})

export {GiveShiftForm}

const GiveShifts = makeMenuItemFormPopup({
  FormControl: GiveShiftForm,
  title: 'One or more Shifts',
  iconName: codeIcons['shifts'],
  className: 'shifts',
})

export {GiveShifts}

/* end shifts */

/* give payment */
const PaymentAmountInput = sources => InputControl({
  label$: just('How much do they pay?'),
  ...sources,
})

const GivePaymentForm = sources => Form({...sources,
  Controls$: just([{field: 'amount', Control: PaymentAmountInput}]),
})

export {GivePaymentForm}

const GivePayment = makeMenuItemFormPopup({
  FormControl: GivePaymentForm,
  title: 'A Payment',
  iconName: codeIcons['payment'],
  className: 'payment',
})

export {GivePayment}
/* end payment */

/* Deposit */
const DepositAmountInput = sources => InputControl({
  label$: just('How much is their Deposit?'),
  ...sources,
})

const GiveDepositForm = sources => Form({...sources,
  Controls$: just([{field: 'amount', Control: DepositAmountInput}]),
})

export {GiveDepositForm}

const GiveDeposit = makeMenuItemFormPopup({
  FormControl: GiveDepositForm,
  title: 'A refundable deposit',
  iconName: codeIcons['deposit'],
  className: 'deposit',
})

export {GiveDeposit}
/* end Deposit */
