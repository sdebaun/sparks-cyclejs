import {run} from '@cycle/core'
import {Observable} from 'rx'
import {modules, makeDOMDriver} from 'cycle-snabbdom'
import {events} from 'snabbdom-material'
import {makeRouterDriver} from 'cyclic-router'
import {makeHistoryDriver, supportsHistory} from 'cyclic-history'
import {createHistory, createHashHistory} from 'history'
import Firebase from 'firebase'

import {
  makeAuthDriver, makeFirebaseDriver, makeQueueDriver,
} from 'drivers/firebaseDriver'

import App from './components/App'

const {
  StyleModule,
  PropsModule,
  AttrsModule,
  ClassModule,
  HeroModule,
  EventsModule,
} = modules

const history = supportsHistory() ?
  createHistory() : createHashHistory()

const historyDriver = makeHistoryDriver(history)

const screenInfo$ =
  Observable.create(obs => events.responsive.addListener(e => obs.onNext(e)))

const isMobile$ = () => screenInfo$
  .map(si => si.size === 1)

const fbRoot = new Firebase('http://sparks-development.firebaseio.com')

run(App, {
  isMobile$,
  DOM: makeDOMDriver('#root', {
    modules: [
      StyleModule,
      PropsModule,
      AttrsModule,
      ClassModule,
      HeroModule,
      EventsModule,
    ],
  }),
  router: makeRouterDriver(historyDriver),
  firebase: makeFirebaseDriver(fbRoot),
  auth$: makeAuthDriver(fbRoot),
  queue$: makeQueueDriver(fbRoot),
})
