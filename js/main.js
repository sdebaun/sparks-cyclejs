import {run} from '@cycle/core'
import {modules, makeDOMDriver} from 'cycle-snabbdom'
import App from './App'

const { StyleModule, PropsModule, AttrsModule, ClassModule, HeroModule, EventsModule } = modules

run(App, {
  DOM: makeDOMDriver('#root', {
    modules: [StyleModule, PropsModule, AttrsModule, ClassModule, HeroModule, EventsModule]
  })
})
