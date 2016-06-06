import {run} from '@cycle/core'

// drivers
import {makeDOMDriver} from 'cycle-snabbdom'
import {makeRouterDriver, supportsHistory} from 'cyclic-router'
import {createHistory, createHashHistory} from 'history'
import Firebase from 'firebase'
import {makeAuthDriver, makeFirebaseDriver, makeQueueDriver} from 'cyclic-fire'
import {isMobile$} from 'drivers/isMobile'
import makeBugsnagDriver from 'drivers/bugsnag'

// app root function
import Root from './root'

const history = supportsHistory() ?
  createHistory() : createHashHistory()

const fbRoot = new Firebase(__FIREBASE_HOST__) // eslint-disable-line

const {sources, sinks} = run(Root, {
  isMobile$,
  DOM: makeDOMDriver('#root'),
  router: makeRouterDriver(history),
  firebase: makeFirebaseDriver(fbRoot),
  auth$: makeAuthDriver(fbRoot),
  queue$: makeQueueDriver(fbRoot.child('!queue')),
  bugsnag: makeBugsnagDriver({
    releaseStage: process.env.BUILD_ENV || 'development',
  }),
})

if (module.hot) {
  module.hot.accept()

  module.hot.dispose(() => {
    sinks.dispose()
    sources.dispose()
  })
}
