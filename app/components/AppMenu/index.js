import {BehaviorSubject, Subject, Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {Appbar, Menu} from 'snabbdom-material'
import {div} from 'cycle-snabbdom'
import {icon} from 'helpers/dom'

const {Item} = Menu

const DOMx = state$ =>
  state$.map(({isOpen,auth}) =>
    div([
      Appbar.Button({className: 'app-menu-button'}, [icon('more_vert')]),
      Menu({isOpen, rightAlign: true, className: 'appmenu'},[
        Item({},JSON.stringify(auth && auth.uid)),
        auth ? null : Item({className: 'login facebook'},'Facebook'),
        auth ? null : Item({className: 'login google'},'Google'),
        auth ? Item({className: 'logout'},'Logout') : null,
      ]),
    ])
  )

export default sources => {
  const authActions$ = Observable.merge(
    sources.DOM.select('.appmenu .login.facebook')
      .events('click').map(e => ({type: 'popup',provider: 'facebook'})),
    sources.DOM.select('.appmenu .login.google')
      .events('click').map(e => ({type: 'popup',provider: 'google'})),
    sources.DOM.select('.appmenu .logout')
      .events('click').map(e => ({type: 'logout'})),
  )

  const maskClick$ = sources.DOM.select('.mask').events('click')

  const isOpen$ = sources.DOM.select('.app-menu-button').events('click')
    .map(true)
    .merge(authActions$.map(false))
    .merge(maskClick$.map(false))
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
