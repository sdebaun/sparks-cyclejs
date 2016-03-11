import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import fabMenu from 'helpers/fabMenu'

// these are action creators specific to cyclic-fire and should live there
import {PROVIDERS} from 'util'

// Bunch Of Sources and Sinks (BOSS) approach to components
// or Bunch of Stinkin' Streams if you prefer
// discuss here: https://github.com/sdebaun/sparks-cyclejs/issues/38

// transformation functions extract certain sources
// and return a stream of something.
// name them after the intent being expressed
// if we were clever and standardized .login etc classnames
// this could be a generic stream constructor, reused in lots of places
const _authActions$ = ({DOM}) =>
  Observable.merge(
    DOM.select('.app-menu .login.facebook').events('click')
      .map(() => PROVIDERS.facebook),
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
// and again if we were clever and standardized .open and .close classnames
// this could be a generic stream creator, reused in lots of places
const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.app-menu-button').events('click').map(true),
  DOM.select('.close-menu').events('click').map(false),
)

// the following functions all deal with the stream to the DOM sink

// this is used by _render below
// dom sink feeding is often most complex part of a component
// dont be afraid to break it down like this
// golf this if you can!!!
const _menuItems = (auth, fullName, isAdmin) => [
  fullName && {className: 'home', label: fullName},
  fullName && {divider: true},
  isAdmin && {className: 'admin', label: 'Admin'},
  auth && {className: 'logout', label: 'Logout'},
  !auth && {label: 'Login with...'},
  // !auth && {className: 'login facebook', label: 'Facebook'},
  !auth && {className: 'login google', label: 'Google'},
].filter(r => !!r)

// the render function takes a snapshot of state
// and composes UI helpers to present something
// break it down into smaller bits if needed
const _render = ({auth, userProfile, isOpen}) =>
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

  // everything past this only relates to the dom sink

  // complex behavior in streams for private view state
  // if it takes more than a line or two to express
  // extract it into another _function$({thing$, ...sources})
  const isOpen$ = _openActions$(sources)
    .merge(auth$.map(false))
    .startWith(false)

  // the dom is just a slightly more complicated transformation
  // but much of it is repeatable; through combineLatestObj hackery
  // snapshots of the state streams are mapped to _render
  const viewState = {
    isOpen$,
    auth$: sources.auth$,
    userProfile$: sources.userProfile$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, auth$, route$}
}
