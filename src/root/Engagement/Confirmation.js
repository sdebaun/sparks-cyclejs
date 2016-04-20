import {Observable as $, Subject} from 'rx'
// const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {h, div} from 'cycle-snabbdom'
// import {log} from 'util'

import {combineDOMsToDiv} from 'util'

import {
  Projects,
  Engagements,
  Organizers,
  Opps,
  ProjectImages,
} from 'components/remote'

import {ProjectItem, ProjectForm, ProjectAvatar} from 'components/project'
import {EngagementItem} from 'components/engagement'

import {
  StepListItem,
} from 'components/ui'

import {
  LargeCard,
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
            insert: ({elm}) => braintree.setup(clientToken,'dropin',{
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

const Step2 = sources => {
  const content = MakePayment(sources)

  const li = StepListItem({...sources,
    title$: $.just('Step 2: Make Your Payment'),
    contentDOM$: content.DOM,
    isOpen$: sources.engagement$.map(({isAssigned, isPaid}) => isAssigned && !isPaid),
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

export default sources => {
  const s1 = Step1(sources)
  const s2 = Step2(sources)

  const card = LargeCard({...sources,
    content$: $.combineLatest(s1.DOM, s2.DOM),
  })

  return {
    DOM: combineDOMsToDiv('.cardcontainer', card),
    queue$: $.merge(s1.queue$, s2.queue$),
  }
}
