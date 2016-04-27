import {Observable as $} from 'rx'
import {combineDOMsToDiv} from 'util'

import {CardUpcomingShifts} from './CardUpcomingShifts'
import {CardApplicationNextSteps} from './CardApplicationNextSteps'
import {CardEnergyExchange} from './CardEnergyExchange'
import {CardConfirmNow} from './CardConfirmNow'
import {CardPickMoreShifts} from './CardPickMoreShifts'
import {CardWhois} from './CardWhois'

export default sources => {
  const who = CardWhois(sources)
  const confirm = CardConfirmNow(sources)
  const app = CardApplicationNextSteps(sources)
  const r2w = CardUpcomingShifts(sources)
  const pms = CardPickMoreShifts(sources)
  const ee = CardEnergyExchange(sources)

  const DOM = combineDOMsToDiv('.cardcontainer',who,confirm,app,r2w,pms,ee)

  return {
    DOM,
    route$: $.merge(confirm.route$, app.route$),
  }
}
