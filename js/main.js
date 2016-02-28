import {run} from '@cycle/core'
import {Observable} from 'rx'
import {modules, makeDOMDriver} from 'cycle-snabbdom'
import {events} from 'snabbdom-material'
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

const isMobile$ = () => {
  let screenInfo$ =
    Observable.create(obs => {
      events.responsive.addListener(screenInfo => {
        obs.onNext(screenInfo)
      })
    }).map(si => si.size <= 2).replay(null, 1)

  const disposable = screenInfo$.connect()

  screenInfo$.dispose = () => disposable.dispose()
  return screenInfo$
}

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
})
