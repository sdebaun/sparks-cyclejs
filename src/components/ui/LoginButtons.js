import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable
import {replace} from 'ramda'

import {PROVIDERS} from 'util'

import {RaisedButton} from 'components/sdm'

import {div} from 'helpers'

const renderLabel = provider => replace('{{provider}}', provider)

const LoginButtons = sources => {
  const labelTemplate$ = sources.label$ || just('Login with {{provider}}')
  const googLabel$ = labelTemplate$.map(renderLabel('Google'))
  const fbLabel$ = labelTemplate$.map(renderLabel('Facebook'))

  const goog = RaisedButton({...sources, label$: googLabel$})
  const fb = RaisedButton({...sources, label$: fbLabel$})

  const auth$ = merge(
    goog.click$.map(PROVIDERS.google),
    fb.click$.map(PROVIDERS.facebook),
  )

  return {
    DOM: combineLatest(goog.DOM, fb.DOM, (...doms) => div('.logins',doms)),
    auth$,
  }
}

export {LoginButtons}
