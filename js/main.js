import { run } from '@cycle/core'
import { Observable } from 'rx'
import { modules, makeDOMDriver } from 'cycle-snabbdom'
import { events } from 'snabbdom-material'

import App from './App'

const { StyleModule, PropsModule, AttrsModule, ClassModule, HeroModule, EventsModule } = modules

const screenInfo$ = 
  Observable.create( obs=>events.responsive.addListener( screenInfo=>obs.onNext(screenInfo) ) )

const isMobile$ = () => screenInfo$
  .map( si=>si.size==1 )

run(App, {
  isMobile$,
  DOM: makeDOMDriver('#root', {
    modules: [StyleModule, PropsModule, AttrsModule, ClassModule, HeroModule, EventsModule]
  })
})
