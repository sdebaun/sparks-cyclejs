import {run} from '@cycle/core'
import {modules, makeDOMDriver} from 'cycle-snabbdom'
import {makeRouterDriver} from 'cyclic-router'
import {makeHistoryDriver, supportsHistory} from 'cyclic-history'
import {createHistory, createHashHistory} from 'history'
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

run(App, {
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
})
