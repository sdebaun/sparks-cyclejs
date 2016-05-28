import {run} from '@cycle/core'

// drivers
import {makeDOMDriver} from 'cycle-snabbdom'
import {makeRouterDriver, supportsHistory} from 'cyclic-router'
import {createHistory, createHashHistory} from 'history'
import firebase from 'firebase'
import {makeAuthDriver, makeFirebaseDriver, makeQueueDriver} from './drivers/cyclic-fire'
import {isMobile$} from 'drivers/isMobile'
import makeBugsnagDriver from 'drivers/bugsnag'

// app root function
import Root from './root'

const history = supportsHistory() ?
  createHistory() : createHashHistory()

const fbConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_URL,
  storageBucket: process.env.STORAGE_BUCKET
}
firebase.initializeApp(fbConfig)
const fbRoot = firebase.database().ref()

const {sources, sinks} = run(Root, {
  isMobile$,
  DOM: makeDOMDriver('#root'),
  router: makeRouterDriver(history),
  firebase: makeFirebaseDriver(fbRoot),
  auth$: makeAuthDriver(firebase.auth()),
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
