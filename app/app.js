import {Observable} from 'rx'
import isolate from '@cycle/isolate'

import Landing from 'routes/Landing'
import Dash from 'routes/Dash'
import Admin from 'routes/Admin'

import {nestedComponent} from 'helpers/router'

import './app.scss'

// Route definitions at this level
const routes = {
  '/': Landing,
  '/dash': isolate(Dash),
  '/admin': isolate(Admin),
}

export default sources => {
  const page$ = nestedComponent(sources.router.define(routes), sources)

  return {
    DOM: page$.flatMapLatest(({DOM}) => DOM),
    auth$: page$.flatMapLatest(({auth$}) => auth$ || Observable.never()),
    queue$: page$.flatMapLatest(({queue$}) => queue$ || Observable.never()),
    router: page$.flatMapLatest(({route$}) => route$ || Observable.never()),
  }
}
