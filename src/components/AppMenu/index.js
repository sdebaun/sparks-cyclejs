import {Observable} from 'rx'
const {just, merge} = Observable
import {div} from 'cycle-snabbdom'

import combineLatestObj from 'rx-combine-latest-obj'

// these are action creators specific to cyclic-fire and should live there
import {PROVIDERS} from 'util'

import {Fab, Menu} from 'components/sdm'
import {icon} from 'helpers'
import menuItem from 'helpers/menuItem'
import {log} from 'util'

const Logout = sources => ({
  click$: sources.DOM.select('.logout').events('click'),
  DOM: just(
    menuItem({
      title: 'Logout',
      iconName: 'remove',
      className: 'logout',
      clickable: true,
    }),
  ),
})

const GoogleLogin = sources => ({
  click$: sources.DOM.select('.login').events('click'),
  DOM: just(
    menuItem({
      title: 'Login with Google',
      iconName: 'remove',
      className: 'login',
      clickable: true,
    }),
  ),
})

const AppMenu = sources => {
  const fab = Fab({iconDOM$: just(icon('more_vert')), ...sources})

  const logout = Logout(sources)
  const googleLogin = GoogleLogin(sources)

  const isOpen$ = fab.click$.startWith(false)

  const menuItems$ = sources.userProfile$
    .map(userProfile =>
      userProfile ? [logout] : [googleLogin]
    ).shareReplay(1)

  const menu = Menu({
    isOpen$,
    children$: menuItems$.map(items => items.map(i => i.DOM)),
    leftAlign$: just(false),
    ...sources,
  })

  const viewState = {
    fabDOM$: fab.DOM,
    menuDOM$: menu.DOM,
  }

  const DOM = combineLatestObj(viewState)
    .map(({fabDOM, menuDOM}) =>
      div({},[fabDOM,menuDOM])
    )

  const auth$ = merge(
    googleLogin.click$.map(PROVIDERS.google),
    logout.click$.map(PROVIDERS.logout),
  )

  return {
    DOM,
    auth$,
    route$: Observable.empty(),
    // route$,
  }
}

export default AppMenu
