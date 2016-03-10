import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {appMenu} from 'helpers'
import {PROVIDERS} from 'util'

const _authActions$ = ({DOM}) =>
  Observable.merge(
    DOM.select('.app-menu .login.facebook').events('click')
      .map(() => PROVIDERS.facebook),
    DOM.select('.app-menu .login.google').events('click')
      .map(() => PROVIDERS.google),
    DOM.select('.app-menu .logout').events('click')
      .map(() => PROVIDERS.logout),
  )

const _navActions$ = ({DOM}) =>
  Observable.merge(
    DOM.select('.app-menu .home').events('click')
      .map(e => '/dash'),
    DOM.select('.app-menu .admin').events('click')
      .map(e => '/admin')
  )

const _stateActions$ = ({DOM}) => ({
  open$: DOM.select('.app-menu-button').events('click'),
  close$: DOM.select('.close-menu').events('click'),
})

const _state$ = ({auth$, userProfile$, isOpen$}) =>
  combineLatestObj({auth$, userProfile$, isOpen$})

const _render = ({auth, userProfile, isOpen}) =>
  appMenu({auth, userProfile, isOpen})

export default sources => {
  const auth$ = _authActions$(sources)

  const route$ = _navActions$(sources)

  const {open$, close$} = _stateActions$(sources)

  const isOpen$ = Observable.merge(
      open$.map(true),
      close$.map(false),
      auth$.map(false),
    ).startWith(false)

  const DOM = _state$({isOpen$, ...sources})
    .map(_render)

  return {DOM, auth$, route$}
}
