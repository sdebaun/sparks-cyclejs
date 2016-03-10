import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {appMenu} from 'helpers'
import fabMenu from 'helpers/fabMenu'

import {PROVIDERS} from 'util'

// transformation functions extract certain sources
// and return a stream of something.
// name them after the intent being expressed
const _authActions$ = ({DOM}) =>
  Observable.merge(
    DOM.select('.app-menu .login.facebook').events('click')
      .map(() => PROVIDERS.facebook), // cyclic-fire/Auth.facebook
    DOM.select('.app-menu .login.google').events('click')
      .map(() => PROVIDERS.google),
    DOM.select('.app-menu .logout').events('click')
      .map(() => PROVIDERS.logout),
  )

// this one also builds clickstreams from the dom
// but transforms them for a different sink
// we should be isolated, can we remove the .app-menu?
const _navActions$ = ({DOM}) =>
  Observable.merge(
    DOM.select('.app-menu .home').events('click')
      .map(e => '/dash'),
    DOM.select('.app-menu .admin').events('click')
      .map(e => '/admin')
  )

// again managing a conceptual grouping of clickstreams
// for a specific purpose, in this case an internal state
const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.app-menu-button').events('click').map(true),
  DOM.select('.close-menu').events('click').map(false),
)

// the following functions all deal with the stream to the DOM sink

// all this does is extract streams from {internal$, ...sources}
// and put them together in a snapshot for the render function
const _state$ = ({auth$, userProfile$, isOpen$}) =>
  combineLatestObj({auth$, userProfile$, isOpen$})

const _render = ({auth, userProfile, isOpen}) =>
  appMenu({auth, userProfile, isOpen})

// this is used by _render below
// dom sink feeding is often most complex part of a component
// dont be afraid to break it down like this
const _menuItems = (auth, fullName, isAdmin) => [
  fullName && {className: 'home', label: fullName},
  isAdmin && {className: 'admin', label: 'Admin'},
  auth && {className: 'logout', label: 'Logout'},
  !auth && {label: 'Login with...'},
  !auth && {className: 'login facebook', label: 'Facebook'},
  !auth && {className: 'login google', label: 'Google'},
].filter(r => !!r)

// the render function takes a snapshot of state
// and composes UI helpers to present something
// break it down into smaller bits if needed
const _render2 = ({auth, userProfile, isOpen}) =>
  fabMenu({
    isOpen,
    className: 'app-menu-button', // necessary with isolate?
    iconName: 'more_vert',
    menu: {rightAlign: true},
    items: _menuItems(
      auth,
      userProfile && userProfile.fullName,
      userProfile && userProfile.isAdmin
    ),
  })

// main function for the component
// should only be a few lines, describing transformations
export default sources => {
  // any streams named after a sink
  // should be used in the return value for that sink
  const auth$ = _authActions$(sources)
  const route$ = _navActions$(sources)

  // sometimes also need to create streams for internal state
  // if it takes more than a line or two to express
  // extract it into another _function$({thing$, ...sources})
  const isOpen$ = _openActions$(sources)
    .merge(auth$.map(false))
    .startWith(false)

  // the dom is just a slightly more complicated transformation
  // _state$ is just taking a 'snapshot' of various streams
  // and mapping them to _render
  const DOM = _state$({isOpen$, ...sources})
    .map(_render)

  return {DOM, auth$, route$}
}
