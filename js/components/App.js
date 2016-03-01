import {Observable} from 'rx'
import isolate from '@cycle/isolate'

import Landing from 'components/Landing'
import Dash from 'components/Dash'
import Admin from 'components/Admin'

import {nestedComponent} from 'helpers/router'

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
