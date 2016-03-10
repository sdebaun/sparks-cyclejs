import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {appMenu} from 'helpers'
import {PROVIDERS} from 'util'

export default sources => {
  const {DOM, auth$, userProfile$} = sources

  const authActions$ = Observable.merge(
    DOM.select('.app-menu .login.facebook').events('click')
      .map(() => PROVIDERS.facebook),
    DOM.select('.app-menu .login.google').events('click')
      .map(() => PROVIDERS.google),
    DOM.select('.app-menu .logout').events('click')
      .map(() => PROVIDERS.logout),
  )

  const nav$ = Observable.merge(
    DOM.select('.app-menu .home').events('click')
      .map(e => '/dash'),
    DOM.select('.app-menu .admin').events('click')
      .map(e => '/admin')
  )

  const closeMenu$ = DOM.select('.close-menu').events('click')

  const isOpen$ = DOM.select('.app-menu-button').events('click')
    .map(true)
    .merge(authActions$.map(false))
    .merge(closeMenu$.map(false))
    .startWith(false)

  return {
    DOM: combineLatestObj({auth$, userProfile$, isOpen$}).map(appMenu),
    auth$: authActions$,
    route$: nav$,
  }
}
