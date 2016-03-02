import {run} from '@cycle/core'
import {Observable} from 'rx'
import {modules, makeDOMDriver} from 'cycle-snabbdom'
import {makeRouterDriver} from 'cyclic-router'
import {makeHistoryDriver, supportsHistory} from 'cyclic-history'
import {createHistory, createHashHistory} from 'history'
import Firebase from 'firebase'

import {
  makeAuthDriver, makeFirebaseDriver, makeQueueDriver,
} from 'drivers/firebaseDriver'

import {isMobile$} from 'drivers/isMobile'

import Root from './root'

const history = supportsHistory() ?
  createHistory() : createHashHistory()

const historyDriver = makeHistoryDriver(history)

const fbRoot = new Firebase('http://sparks-development.firebaseio.com')

const {sources, sinks} = run(Root, {
  isMobile$,
  DOM: makeDOMDriver('#root'),
  router: makeRouterDriver(historyDriver),
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
