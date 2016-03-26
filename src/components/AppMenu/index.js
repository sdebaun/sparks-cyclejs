require('./styles.scss')

import {Observable} from 'rx'
const {just, merge} = Observable
import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'

// import {log} from 'util'

// these are action creators specific to cyclic-fire and should live there
import {PROVIDERS} from 'util'

import {Fab, Menu, MenuItem} from 'components/sdm'
import {icon} from 'helpers'

const Dash = sources => MenuItem({...sources,
  iconName$: just('home'),
  title$: sources.userProfile$.pluck('fullName'),
})

const Admin = sources => MenuItem({...sources,
  iconName$: just('build'),
  title$: just('Admin'),
})

const Logout = sources => MenuItem({...sources,
  iconName$: just('sign-out'),
  title$: just('Logout'),
})

const GoogleLogin = sources => MenuItem({...sources,
  iconName$: just('google-plus-square'),
  title$: just('Login with Google'),
})

const AppMenu = sources => {
  const fab = Fab({iconDOM$: just(icon('more_vert')), ...sources})

  const dash = isolate(Dash,'dash')(sources)
  const admin = isolate(Admin,'admin')(sources)
  const logout = isolate(Logout,'logout')(sources)
  const googleLogin = isolate(GoogleLogin,'google')(sources)

  const isOpen$ = fab.click$.startWith(false)

  const menuItems$ = sources.userProfile$
    .map(userProfile =>
      userProfile ?
        [dash, userProfile.isAdmin ? admin : null, logout].filter(i => !!i) :
        [googleLogin]
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
    .map(({fabDOM, menuDOM}) => div('.app-menu',[fabDOM,menuDOM]))

  const auth$ = merge(
    googleLogin.click$.map(PROVIDERS.google),
    logout.click$.map(PROVIDERS.logout),
  )

  const route$ = merge(
    dash.click$.map('/dash'),
    admin.click$.map('/admin'),
  )

  return {
    DOM,
    auth$,
    route$,
  }
}

export default AppMenu
