import {Observable as $} from 'rx'
import {combineDOMsToDiv} from 'util'

import {CardUpcomingShifts} from './CardUpcomingShifts'
import {CardApplicationNextSteps} from './CardApplicationNextSteps'
import {CardEnergyExchange} from './CardEnergyExchange'
import {CardConfirmNow} from './CardConfirmNow'

export default sources => {
  const confirm = CardConfirmNow(sources)
  const app = CardApplicationNextSteps(sources)
  const r2w = CardUpcomingShifts(sources)
  const ee = CardEnergyExchange(sources)

  const DOM = combineDOMsToDiv('.cardcontainer',confirm,app,r2w,ee)

  return {
    DOM,
    route$: $.merge(confirm.route$, app.route$),
  }
}
