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

export default {
  waiver: GiveWaiver,
  shifts: GiveShifts,
  payment: GivePayment,
  deposit: GiveDeposit,
  help: GetHelp,
  ticket: GetTicket,
  tracked: GetTracked,
  schwag: GetSchwag,
}
