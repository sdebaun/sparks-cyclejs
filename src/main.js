import {run} from '@cycle/core'

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

const fbRoot = new Firebase('http://sparks-dev-stevo.firebaseio.com')

const {sources, sinks} = run(Root, {
  isMobile$,
  DOM: makeDOMDriver('#root'),
  router: makeRouterDriver(history),
  firebase: makeFirebaseDriver(fbRoot),
  auth$: makeAuthDriver(fbRoot),
  queue$: makeQueueDriver(fbRoot.child('!queue')),
})

if (module.hot) {
  module.hot.accept()

  module.hot.dispose(() => {
    sinks.dispose()
    sources.dispose()
  })
}
