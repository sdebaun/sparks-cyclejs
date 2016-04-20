import {Observable as $, Subject} from 'rx'
// const {just, merge, combineLatest} = Observable

import {h, div} from 'cycle-snabbdom'
// import {log} from 'util'

import {combineDOMsToDiv} from 'util'

import {
  Engagements,
} from 'components/remote'

import {
  StepListItem,
  DescriptionListItem,
  TitleListItem,
  ToDoListItem,
} from 'components/ui'

import {
  LargeCard,
  ListItem,
} from 'components/sdm'

import braintree from 'braintree-web'

const MakePayment = sources => {
  const clientToken$ = sources.engagement$
    .pluck('paymentClientToken')

  const paymentNonce$ = new Subject()
  const queue$ = paymentNonce$
    .withLatestFrom(
      sources.engagementKey$,
      (paymentNonce, key) => ({key, values: {paymentNonce}})
    )
    .map(Engagements.action.pay)
    .tap(x => console.log('engagement payment action:', x))

  return {
    DOM: clientToken$.map(clientToken =>
      h('form',[
        div('#braintree', {
          hook: {
            insert: () => braintree.setup(clientToken,'dropin',{
              container: 'braintree',
              onPaymentMethodReceived: obj => paymentNonce$.onNext(obj.nonce),
            }),
          },
        },[]),
        h('input',{attrs: {type: 'submit', value: 'Pay Now'}}),
      ])
    ),
    queue$,
  }
}

import ChooseShifts from './Schedule/Priority'
import codeIcons from 'components/opp/codeIcons'

const PaymentInstructions = sources => DescriptionListItem({...sources,
  title$: $.just('Make a payment and/or a deposit commitment and you will be confirmed.'),
})

const formatAmount = s =>
  `$${parseFloat(`${s}`.replace(/[^0-9\.]/g, ''), 10).toFixed(2)}`

const formatLabel = s =>
  `${s}`.replace(/[$0-9\.]/g, '')

const ItemPayment = sources => ListItem({...sources,
  iconName$: $.just(codeIcons['payment']),
  title$: sources.commitmentPayment$.map(({amount}) => formatLabel(amount)),
  subtitle$: $.just('The entire amount goes to the organizer for their stated purpose.'),
  rightDOM$: sources.amountPayment$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const ItemDeposit = sources => ListItem({...sources,
  iconName$: $.just(codeIcons['deposit']),
  title$: $.just('Refundable Deposit'),
  subtitle$: $.just('This will be charged to your card and given to the organizer if you do not complete your commitments or cancel less than 7 days in advance.'),
  rightDOM$: sources.amountDeposit$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const ItemSparks = sources => ListItem({...sources,
  iconName$: $.just('power'),
  title$: $.just('Sparks Contribution'),
  subtitle$: $.just('This includes 3rd-party payment processing fees and service expenses.'),
  rightDOM$: sources.amountSparks$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const ItemNonrefund = sources => ListItem({...sources,
  // iconName$: $.just('power'),
  classes$: $.just({total: true}),
  title$: $.just('Nonrefundable Total Paid Now'),
  // subtitle$: $.just('This includes 3rd-party payment processing fees and service expenses.'),
  rightDOM$: sources.amountNonrefund$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const ItemRefund = sources => ListItem({...sources,
  // iconName$: $.just('power'),
  title$: $.just('Deposit Commitment'),
  subtitle$: $.just('You will not be charged if you fulfill your commitments or cancel early.'),
  rightDOM$: sources.amountDeposit$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const Step2Content = sources => {
  const inst = PaymentInstructions(sources)
  const paymentForm = MakePayment(sources)
  const ipmt = ItemPayment(sources)
  const idep = ItemDeposit(sources)
  const ispk = ItemSparks(sources)
  const ref = ItemRefund(sources)
  const nref = ItemNonrefund(sources)

  return {
    DOM: combineDOMsToDiv('',inst,ipmt,idep,ispk,ref,nref,paymentForm),
    queue$: paymentForm.queue$,
  }
}

const Step2 = sources => {
  const content = Step2Content(sources)

  const li = StepListItem({...sources,
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

const Step1 = sources => {
  const content = ChooseShifts(sources)

  const li = StepListItem({...sources,
    title$: $.just('Step 1: Choose Your Shifts'),
    contentDOM$: content.DOM,
    isOpen$: sources.engagement$.map(({isAssigned}) => !isAssigned),
  })

  return {
    ...li,
    queue$: content.queue$,
  }
}

const _Title = sources => TitleListItem({...sources,
  title$: sources.engagement$.map(({isPaid}) =>
    isPaid ? 'You Are Confirmed' : 'Confirm Your Spot'
  ),
})

const _AllDone = sources => ToDoListItem({...sources,
  title$: $.just('You\'re confirmed!'),
  isDone$: $.just(false),
  subtitle$: $.just('We will send you a message when the event is coming up.'),
  path$: sources.engagementKey$.map(k => `/engaged/${k}`),
})

export default sources => {
  const t = _Title(sources)
  const s1 = Step1(sources)
  const s2 = Step2(sources)
  const ad = _AllDone(sources)

  const card = LargeCard({...sources,
    content$: $.combineLatest(t.DOM, s1.DOM, s2.DOM, ad.DOM),
  })

  const queue$ = $.merge(s1.queue$, s2.queue$)
  queue$.subscribe(x => console.log('new queue task:', x))

  return {
    DOM: combineDOMsToDiv('.cardcontainer', card),
    queue$,
    route$: ad.route$,
  }
}
