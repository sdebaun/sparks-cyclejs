import {BehaviorSubject, Subject, Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {Appbar, Menu} from 'snabbdom-material'
import {div} from 'cycle-snabbdom'
import {icon} from 'helpers/dom'
import {menu} from 'helpers/layout/menu'

const {Item} = Menu

const DOMx = state$ =>
  state$.map(({isOpen,auth}) => {
    const id = JSON.stringify(auth && auth.uid)
    return div({}, [
      Appbar.Button({className: 'app-menu-button'}, [
        icon('more_vert'),
      ]),
      menu({isOpen, rightAlign: true}, [
        id === 'null' ? null : Item({}, [id]),
        auth ? null : Item({className: 'login facebook'},'Facebook'),
        auth ? null : Item({className: 'login google'},'Google'),
        auth ? Item({className: 'logout'},'Logout') : null,
      ]),
    ])
  })

export default sources => {
  const authActions$ = Observable.merge(
    sources.DOM.select('.app-menu .login.facebook')
      .events('click').map(e => ({type: 'popup',provider: 'facebook'})),
    sources.DOM.select('.app-menu .login.google')
      .events('click').map(e => ({type: 'popup',provider: 'google'})),
    sources.DOM.select('.app-menu .logout')
      .events('click').map(e => ({type: 'logout'})),
  )

  const closeMenu$ = sources.DOM.select('.close-menu').events('click')

  const isOpen$ = sources.DOM.select('.app-menu-button').events('click')
    .map(true)
    .merge(authActions$.map(false))
    .merge(closeMenu$.map(false))
    .startWith(false)

  const state$ = combineLatestObj({
    auth$: sources.auth$,
    isOpen$,
  })

  return {
    DOM: DOMx(state$),
    auth$: authActions$,
  }
}
