import {BehaviorSubject, Subject, Observable} from 'rx'
import {Appbar, Menu} from 'snabbdom-material'
import {div} from 'cycle-snabbdom'
import {icon} from 'helpers/dom'

const {Item} = Menu

export default sources => {
  const {auth$, DOM} = sources

  const isOpen$ = new BehaviorSubject()

  const authActions$ = Observable.merge(
    DOM.select('.appmenu .login.facebook')
      .events('click').map(e => ({type: 'popup',provider: 'facebook'})),
    DOM.select('.appmenu .login.google')
      .events('click').map(e => ({type: 'popup',provider: 'google'})),
    DOM.select('.appmenu .logout')
      .events('click').map(e => ({type: 'logout'})),
  )

  authActions$.subscribe(() => isOpen$.onNext(false))

  const set = val => isOpen$.onNext(val)

  return {
    DOM: isOpen$.startWith(false).withLatestFrom(auth$, (isOpen,auth) =>
      div([
        Appbar.Button({onClick: e => set(!isOpen)}, [icon('more_vert')]),
        Menu({isOpen, rightAlign: true, onClose: e => set(false), className: 'appmenu'},[
          Item({},JSON.stringify(auth && auth.uid)),
          auth ? null : Item({className: 'login facebook'},'Facebook'),
          auth ? null : Item({className: 'login google'},'Google'),
          auth ? Item({className: 'logout'},'Logout') : null,
        ]),
      ])
    ),
    auth$: authActions$,
  }
}
