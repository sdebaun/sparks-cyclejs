import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import AppMenu from 'components/AppMenu'
import {PROVIDERS} from 'util'
import {landing} from 'helpers'

// import {RaisedButton} from 'components/cyclic-surface-material'
import {RaisedButton} from 'components/sdm'

import {log} from 'util'

import './styles.scss'

// const LoginButtons = sources => {
//   const goog = RaisedButton({label$: just('Login with Google'), ...sources})
//   const fb = RaisedButton({label$: just('Login with Facebook'), ...sources})

//   const auth$ = merge(
//     goog.click$.map(PROVIDERS.google),
//     fb.click$.map(PROVIDERS.facebook),
//   )

//   return {
//     DOM: combineLatest(goog.DOM, (...doms) => div({},doms)),
//     auth$,
//     route$,
//   }
// }

export default (sources) => {
  const appMenu = AppMenu(sources)

  const googleLogin =
    RaisedButton({label$: just('Login with Google'), ...sources})

  const google$ = googleLogin.click$.map(PROVIDERS.google)

  const facebook$ = sources.DOM.select('.signup .facebook').events('click')
    .map(() => PROVIDERS.facebook)

  // const google$ = sources.DOM.select('.signup .google').events('click')
  //   .map(() => PROVIDERS.google)

  const authActions$ = Observable.merge(appMenu.auth$, facebook$, google$)

  googleLogin.DOM.subscribe(log('gLDOM'))

  const viewState = {
    appMenuDOM$: appMenu.DOM,
    googleLoginDOM$: googleLogin.DOM,
  }

  const DOM = combineLatestObj(viewState)
    .map(({appMenuDOM, googleLoginDOM}) =>
      // landing(googleLoginDOM, googleLoginDOM)
      landing(appMenuDOM, googleLoginDOM)
    )

  return {
    DOM,
    auth$: authActions$,
    route$: sources.redirectLogin$,
  }
}
