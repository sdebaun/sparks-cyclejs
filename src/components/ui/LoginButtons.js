import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable

import {PROVIDERS} from 'util'

import {RaisedButton} from 'components/sdm'

import {div} from 'helpers'

const LoginButtons = sources => {
  const goog = RaisedButton({label$: just('Login with Google'), ...sources})
  const fb = RaisedButton({label$: just('Login with Facebook'), ...sources})

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
