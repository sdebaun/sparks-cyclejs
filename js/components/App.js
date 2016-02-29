import {Observable} from 'rx'

import Landing from 'components/Landing'
import Dash from 'components/Dash'

// Route definitions at this level
const routes = {
  '/': Landing,
  '/dash': Dash,
}

export default sources => {
  // On route changes path$ and value$ are the path and values of
  // the matched route definition
  const {path$, value$} = sources.router.define(routes)

  // zip path and value together to call the matched component with a new
  // router instance nested at the path matched
  const page$ = path$.zip(value$,
    (path, value) => value({...sources, router: sources.router.path(path)})
  )

  return {
    DOM: page$.flatMapLatest(({DOM}) => DOM),
    auth$: page$.flatMapLatest(
      ({auth$}) => typeof auth$ === `undefined` ? Observable.never() : auth$
    ),
  }
}
