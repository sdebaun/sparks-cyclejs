import {Observable as $} from 'rx'
import {combineDOMsToDiv} from 'util'
import isolate from '@cycle/isolate'

import {icon} from 'helpers'

import {
  StepListItemDumb,
} from 'components/ui'

import {
  ListItem,
  RaisedButton,
} from 'components/sdm'

import MakePayment from './MakePayment'

import {
  Engagements,
} from 'components/remote'

const ItemPaymentError = sources => ListItem({...sources,
  // iconName$: $.just('power'),
  isVisible$: sources.engagement$.map(({paymentError}) => paymentError),
  title$: sources.engagement$
    .map(({paymentError}) => `What!? ${paymentError}???`),
  subtitle$: $.just('Evil internet monkies have interfered with ' +
    'processing your payment. Refresh the page and try again, ' +
    'or contact help@sparks.network.'
  ),
  leftDOM$: $.just(icon('error','accent')),
})

const PaymentParts = sources => {
  const paymentForm = MakePayment(sources)
  const err = ItemPaymentError(sources)

  return {
    DOM: combineDOMsToDiv('',paymentForm,err),
    queue$: paymentForm.queue$,
  }
}

const NoPaymentTitle = sources => ListItem({...sources,
  title$: $.just('No payment needed.'),
})

const ConfirmWithoutPayment = sources => {
  const b = isolate(RaisedButton)({...sources,
    label$: $.just('Confirm'),
  })

  const queue$ = b.click$
    .withLatestFrom(
      sources.engagementKey$,
      (click, key) => ({key})
    )
    .map(Engagements.action.pay) // this should be confirmWithoutPayment
    .tap(x => console.log('engagement payment action:', x))

  return {
    ...b,
    queue$,
  }
}

const NoPaymentNeeded = sources => {
  const t = NoPaymentTitle(sources)
  const confirm = ConfirmWithoutPayment(sources)

  return {
    DOM: combineDOMsToDiv('',t,confirm),
    queue$: confirm.queue$,
  }
}

import Accountability from './Accountability'
import Nonrefundable from './Nonrefundable'

import {hideable} from 'util'

const Step2Content = sources => {
  const acct = hideable(Accountability)({...sources,
    isVisible$: sources.hasDeposit$,
  })
  const nonref = hideable(Nonrefundable)({...sources,
    isVisible$: sources.hasNonrefund$,
  })

  const showPayment$ = $.combineLatest(
    sources.hasDeposit$, acct.isAgreed$,
    sources.hasNonrefund$, nonref.isAgreed$,
    (hasD, okD, hasN, okN) =>
      (hasD || hasN) &&
      (!hasD || okD) &&
      (!hasN || okN)
  )

  const pmt = hideable(PaymentParts)({...sources,
    isVisible$: showPayment$,
  })
  const nopmt = hideable(NoPaymentNeeded)({...sources,
    isVisible$: $.combineLatest(
      sources.hasDeposit$, sources.hasNonrefund$,
      (d,nr) => !d && !nr
    ),
  })

  return {
    DOM: combineDOMsToDiv('',acct,nonref,pmt,nopmt),
    // queue$: $.merge(pmt.queue$,nopmt.queue$),
    queue$: $.merge(pmt.queue$),
  }
}

export default sources => {
  const content = Step2Content(sources)

  const li = StepListItemDumb({...sources,
    title$: $.just('Step 2: Make Your Payment'),
    contentDOM$: content.DOM,
    isOpen$: sources.engagement$
      .map(({isAssigned, isPaid}) => isAssigned && !isPaid),
  })

  return {
    ...li,
    queue$: content.queue$,
  }
}
