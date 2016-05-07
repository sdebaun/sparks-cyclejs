import Cycle from '@cycle/rx-run'

// drivers
import {makeDOMDriver} from 'cycle-snabbdom'
import {makeRouterDriver, supportsHistory} from 'cyclic-router'
import {createHistory, createHashHistory} from 'history'
import Firebase from 'firebase'
import {makeAuthDriver, makeFirebaseDriver, makeQueueDriver} from 'cyclic-fire'
import {isMobile$} from 'drivers/isMobile'

// app root function
import Root from './root'

const history = supportsHistory() ?
  createHistory() : createHashHistory()

const fbRoot = new Firebase(__FIREBASE_HOST__) // eslint-disable-line

Cycle.run(Root, {
  isMobile$,
  DOM: makeDOMDriver('#root'),
  router: makeRouterDriver(history),
  firebase: makeFirebaseDriver(fbRoot),
  auth$: makeAuthDriver(fbRoot),
  queue$: makeQueueDriver(fbRoot.child('!queue')),
})
