import {Observable as $} from 'rx'
import {combineDOMsToDiv} from 'util'
import isolate from '@cycle/isolate'
import {h, div} from 'cycle-snabbdom'
import {startValue} from 'util'

import {
  ListItem,
  ListItemNewTarget,
  ListItemCheckbox,
} from 'components/sdm'

import {hideable} from 'util'

import codeIcons from 'components/opp/codeIcons'

const formatAmount = s =>
  '$' + s.toFixed(2)

const formatLabel = s =>
  ('' + s).replace(/[$0-9\.]/g, '')

const Title = sources => ListItemNewTarget({...sources,
  title$: $.just('Confirmation Payment'),
  classes$: $.just({'list-item-subtitle': true}),
  subtitle$: $.just(div({},[
    `Pay this now to lock in your shifts and secure your spot.`,
    h('br'),
    h('a',
      'Learn how our accountability system lets you secure your spot'
    ),
  ])),
  url$: $.just('http://blog.sparks.network/p/refunds-and-deposit-returns.html'),
})

const ItemPayment = sources => ListItem({...sources,
  iconName$: $.just(codeIcons['payment']),
  title$: sources.commitmentPayment$.map(({amount}) => formatLabel(amount)),
  subtitle$: $.just('The entire amount goes to the organizer ' +
    'for their stated purpose.'),
  rightDOM$: sources.amountPayment$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const ItemSparks = sources => ListItem({...sources,
  iconName$: $.just('power'),
  title$: $.just('Sparks Contribution'),
  subtitle$: $.just('This includes 3rd-party payment processing ' +
    'fees and service expenses.'
  ),
  rightDOM$: sources.amountSparks$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const Agree = sources => startValue(ListItemCheckbox,false)({...sources,
  title$: $.just('Confirm Total Payment'),
  classes$: $.just({total: true}),
  subtitle$: $.just(`
    I understand that Sparks.Network passes this on to the organizer
    and cannot issue refunds for this payment.
    The project organizer is responsible for fulfilling their obligations
    to you and refunding this payment if they do not.
  `),
  rightDOM$: sources.amountNonrefund$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

export default sources => {
  const t = Title(sources)
  const pmt = hideable(ItemPayment)({...sources,
    isVisible$: sources.hasPayment$,
  })
  const sparks = ItemSparks(sources)
  const agree = isolate(Agree)(sources)

  return {
    DOM: combineDOMsToDiv('',t,pmt,sparks,agree),
    isAgreed$: agree.value$,
  }
}
