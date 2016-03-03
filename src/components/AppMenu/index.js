import {BehaviorSubject, Subject, Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {Appbar, Menu} from 'snabbdom-material'
import {div, a} from 'cycle-snabbdom'
import {icon} from 'helpers/dom'
import {menu} from 'helpers/layout/menu'

const {Item} = Menu

const _DOM = ({isOpen,auth,userName,isAdmin}) => {
  return div({}, [
    Appbar.Button({className: 'app-menu-button'}, [
      icon('more_vert'),
    ]),
    menu({isOpen, rightAlign: true}, [
      userName ? Item({className: 'home'},userName) : null,
      isAdmin ? Item({className: 'admin'},'Admin') : null,
      auth ? null : Item({className: 'login facebook'},'Facebook'),
      auth ? null : Item({className: 'login google'},'Google'),
      auth ? Item({className: 'logout'},'Logout') : null,
    ]),
  ])
}

export default sources => {
  const authActions$ = Observable.merge(
    sources.DOM.select('.app-menu .login.facebook').events('click')
      .map(e => ({type: 'popup',provider: 'facebook'})),
    sources.DOM.select('.app-menu .login.google').events('click')
      .map(e => ({type: 'popup',provider: 'google'})),
    sources.DOM.select('.app-menu .logout').events('click')
      .map(e => ({type: 'logout'})),
  )

  const nav$ = Observable.merge(
    sources.DOM.select('.app-menu .home').events('click')
      .map(e => '/dash'),
    sources.DOM.select('.app-menu .admin').events('click')
      .map(e => '/admin')
  )

  const closeMenu$ = sources.DOM.select('.close-menu').events('click')

  const isOpen$ = sources.DOM.select('.app-menu-button').events('click')
    .map(true)
    .merge(authActions$.map(false))
    .merge(closeMenu$.map(false))
    .startWith(false)

  const DOM = combineLatestObj({
    auth$: sources.auth$,
    userName$: sources.userProfile$.pluck('fullName').startWith(null),
    isAdmin$: sources.userProfile$.pluck('isAdmin').startWith(false),
    isOpen$,
  }).map(_DOM)

  return {
    DOM,
    auth$: authActions$,
    route$: nav$,
  }
}
