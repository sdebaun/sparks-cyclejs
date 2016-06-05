import {Observable as $} from 'rx'
import {combineDOMsToDiv} from 'util'
import isolate from '@cycle/isolate'
import {h, div} from 'cycle-snabbdom'
import {startValue} from 'util'

import {
  ListItemNewTarget,
  ListItemCheckbox,
} from 'components/sdm'

const formatAmount = s =>
  '$' + s.toFixed(2)

const Agree = sources => startValue(ListItemCheckbox,false)({...sources,
  title$: $.just('I Promise!'),
  classes$: $.just({total: true}),
  subtitle$: $.just(`
    I agree to let Sparks.Network charge my card or Paypal account
    on behalf of the organizer
    if I do not complete my shifts or cancel my commitment before the event.
    I understand that Sparks.Network will arbitrate any disputes I have with
    the organizer and agree to abide by their decision.
  `),
  rightDOM$: sources.amountDeposit$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const Title = sources => ListItemNewTarget({...sources,
  title$: $.just('Accountability Amount'),
  classes$: $.just({'list-item-subtitle': true}),
  subtitle$: $.just(div({},[
    `You are NOT paying this right now!`,
    h('br'),
    h('a',
      'Learn how our accountability system lets you secure your spot'
    ),
  ])),
  url$: $.just('http://blog.sparks.network/p/refunds-and-deposit-returns.html'),
})

export default sources => {
  const t = Title(sources)
  const agree = isolate(Agree)(sources)

  return {
    DOM: combineDOMsToDiv('',t,agree),
    isAgreed$: agree.value$,
  }
}

