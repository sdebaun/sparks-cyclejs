import {
  GiveWaiver,
  GiveShifts,
  GivePayment,
  GiveDeposit,
} from './GiveItems'

import {
  GetHelp,
  GetTicket,
  GetTracked,
  GetSchwag,
} from './GetItems'

const augmentItem$ = (code, component) => sources => {
  const sinks = component(sources)
  return {...sinks, item$: sinks.item$.map(i => ({...i, code}))}
}

export default {
  waiver: augmentItem$('waiver', GiveWaiver),
  shifts: augmentItem$('shifts', GiveShifts),
  payment: augmentItem$('payment', GivePayment),
  deposit: augmentItem$('deposit', GiveDeposit),
  help: augmentItem$('help', GetHelp),
  ticket: augmentItem$('ticket', GetTicket),
  tracked: augmentItem$('tracked', GetTracked),
  schwag: augmentItem$('schwag', GetSchwag),
}
