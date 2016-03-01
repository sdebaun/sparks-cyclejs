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
  // On route changes path$ and value$ are the path and values of
  // the matched route definition
  const match = sources.router.define(routes)

  // zip path and value together to call the matched component with a new
  // router instance nested at the path matched
  const page$ = nestedComponent(match, sources).shareReplay(1)

  return {
    DOM: page$.flatMapLatest(({DOM}) => DOM),
    auth$: page$.flatMapLatest(({auth$}) => auth$ || Observable.never()),
    queue$: page$.flatMapLatest(({queue$}) => queue$ || Observable.never()),
    router: page$.flatMapLatest(({route$}) => route$ || Observable.never()),
  }
}
