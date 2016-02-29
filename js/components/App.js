import {Observable} from 'rx'

import Landing from 'components/Landing'
import Dash from 'components/Dash'
import Admin from 'components/Admin'

// Route definitions at this level
const routes = {
  '/': Landing,
  '/dash': Dash,
  '/admin': Admin,
}

export default sources => {
  // On route changes path$ and value$ are the path and values of
  // the matched route definition
  const {path$, value$} = sources.router.define(routes)

  // zip path and value together to call the matched component with a new
  // router instance nested at the path matched
  const page$ = path$.zip(value$,
    (path, value) => value({...sources, router: sources.router.path(path)})
  ).shareReplay(1)

  return {
    DOM: page$.flatMapLatest(({DOM}) => DOM),
    // auth$: page$.flatMapLatest(({auth$}) => auth$ || Observable.never()),
    queue$: page$.flatMapLatest(
      ({queue$}) => typeof queue$ === `undefined` ?
        Observable.just(null) : queue$
    ),
    router: page$.flatMapLatest(
      ({route$}) => typeof route$ === `undefined` ? Observable.just() : route$
    ),
  }
}
