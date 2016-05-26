import {Observable as $, Subject} from 'rx'
// const {just, merge, combineLatest} = Observable

import {h, div} from 'cycle-snabbdom'
// import {log} from 'util'

import {combineDOMsToDiv} from 'util'
import {icon} from 'helpers'

import {
  Engagements,
} from 'components/remote'

import {
  StepListItem,
  StepListItemDumb,
  DescriptionListItem,
  TitleListItem,
} from 'components/ui'

import {
  LargeCard,
  ListItem,
  ListItemWithDialog,
  ListItemNavigating,
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

  const isVisible$ = $.merge(
    $.just(true),
    queue$.map(false),
  )

  const viewState$ = $.combineLatest(clientToken$, isVisible$)

  return {
    DOM: viewState$.map(([clientToken, isVisible]) =>
      isVisible ?
      h('form',{style: {marginBottom: '1em'}}, [
        div('#braintree', {
          hook: {
            insert: () => braintree.setup(clientToken,'dropin',{
              container: 'braintree',
              onPaymentMethodReceived: obj => paymentNonce$.onNext(obj.nonce),
            }),
          },
        },[]),
        h('button.waves-button.waves-float.waves-light.waves-effect',
          {
            attrs: {type: 'submit'},
            style: {fontSize: '16px', lineHeight: '36px',
              padding: '0 24px', textAlign: 'center',
              backgroundColor: 'rgb(0,150,136)', color: '#FFF',
            },
          },
          ['Pay With This']
        ),
      ]) :
      div('','Payment submitted, thank you!')
    ) ,
    queue$,
  }
}

import ChooseShifts from './Schedule/Priority'
import codeIcons from 'components/opp/codeIcons'

const PaymentInstructions = sources => DescriptionListItem({...sources,
  title$:
    $.of('Make a payment and/or a deposit commitment ' +
      'and you will be confirmed.'),
})

const parseToCurrency = s =>
  parseFloat(('' + s).replace(/[^0-9\.]/g, ''), 10).toFixed(2)

const formatAmount = s =>
  '$' + parseToCurrency(s)

const formatLabel = s =>
  ('' + s).replace(/[$0-9\.]/g, '')

const ItemPayment = sources => ListItem({...sources,
  iconName$: $.just(codeIcons['payment']),
  title$: sources.commitmentPayment$.map(({amount}) => formatLabel(amount)),
  subtitle$: $.just('The entire amount goes to the organizer ' +
    'for their stated purpose.'),
  rightDOM$: sources.amountPayment$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const ItemDeposit = sources => ListItemWithDialog({...sources,
  isOpen$: sources.DOM.select(':root').events('click')
    .startWith(false).scan(acc => !acc, true),
  iconName$: $.just(codeIcons['deposit']),
  title$: $.just('Accountability Amount'),
  subtitle$: $.just('Click me for more details on what this means.'),
  dialogContentDOM$: $.just(div({}, [
    h('p', {}, [
      'This amount will',
      h('b', {}, [' not ']),
      'be charged to you if you complete the shifts you have signed up for.',
    ]),
    h('p', {}, [
      'However, in the event that you do',
      h('b', {}, [' not ']),
      'follow through with your commitments, you',
      h('b', {}, [' will ']),
      'be charged this full amount.',
    ]),
  ])),
  rightDOM$: sources.amountDeposit$.map(amount =>
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

const ItemNonrefund = sources => ListItem({...sources,
  // iconName$: $.just('power'),
  classes$: $.just({total: true}),
  title$: $.just('Nonrefundable Total Paid Now'),
  rightDOM$: sources.amountNonrefund$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

const ItemRefund = sources => ListItem({...sources,
  // iconName$: $.just('power'),
  title$: $.just('Deposit Commitment'),
  subtitle$: $.just('You will not be charged if you fulfill ' +
    'your commitments or cancel early.'
  ),
  rightDOM$: sources.amountDeposit$.map(amount =>
    div('.money', [formatAmount(amount)])
  ),
})

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

const Step2Content = sources => {
  const inst = PaymentInstructions(sources)
  const paymentForm = MakePayment(sources)
  const ipmt = ItemPayment(sources)
  const idep = ItemDeposit(sources)
  const ispk = ItemSparks(sources)
  const ref = ItemRefund(sources)
  const nref = ItemNonrefund(sources)
  const err = ItemPaymentError(sources)

  return {
    DOM: combineDOMsToDiv('',inst,ipmt,idep,ispk,ref,nref,paymentForm,err),
    queue$: paymentForm.queue$,
  }
}

const Step2 = sources => {
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

const Step1 = sources => {
  const content = ChooseShifts(sources)

  const li = StepListItem({...sources,
    title$: sources.neededAssignments$.map(n => n > 0 ?
      `Step 1: Choose ${n} More Preferred Shifts` :
      `Step 1: Preferred Shifts Selected`
    ),
    // title$: $.just('Step 1: Choose Your Shifts'),
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

const _AllDone = sources => ListItemNavigating({...sources,
  title$: $.just('You\'re confirmed!'),
  subtitle$: $.just('We will send you a message when the event is coming up.'),
  leftDOM$: $.of(icon('chevron-circle-right', 'accent')),
  path$: sources.engagementKey$.map(k => `/engaged/${k}`),
  isVisible$: sources.engagement$
    .map(({isPaid, isAssigned}) => isPaid && isAssigned),
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
