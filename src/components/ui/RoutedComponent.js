import {Observable} from 'rx'
const {never} = Observable

import {div} from 'helpers'

const pluckLatestOrNever = (k,s$) =>
  s$.map(c => c[k] || never()).switch().share()

export const RoutedComponent = sources => {
  const comp$ = sources.routes$
    .map(routes => sources.router.define(routes))
    .switch()
    .map(({path, value}) =>
      value({...sources, router: sources.router.path(path)})
    )
    .shareReplay(1)

  return {
    DOM: pluckLatestOrNever('DOM', comp$),
      // .startWith(div('.loading',['Loading...'])), // add this
    ...['auth$', 'queue$', 'route$'].reduce((a,k) =>
      (a[k] = pluckLatestOrNever(k,comp$)) && a, {}
    ),
  }
}
