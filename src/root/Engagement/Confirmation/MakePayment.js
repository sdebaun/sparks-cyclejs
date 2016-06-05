import braintree from 'braintree-web'

import {Observable as $, Subject} from 'rx'
import {h, div} from 'cycle-snabbdom'

import {
  Engagements,
} from 'components/remote'

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
              onReady: () => {
                document.getElementById('payment-submit')
                  .style.display = 'inline-block'
                document.getElementById('payment-loading')
                  .style.display = 'none'
              },
            }),
          },
        }),
        h('div#payment-loading', ['Loading...']),
        h(`button
            #payment-submit
            .waves-button.waves-float.waves-light.waves-effect`,
          {
            attrs: {type: 'submit'},
            style: {fontSize: '16px', lineHeight: '36px',
              padding: '0 24px', textAlign: 'center',
              backgroundColor: 'rgb(0,150,136)', color: '#FFF',
              display: 'none',
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

export default MakePayment
