import {Observable} from 'rx'
const {never} = Observable

export const RoutedComponent = sources => {
  const comp$ = sources.routes$
    .map(routes => sources.router.define(routes))
    .switch()
    .map(({path, value}) =>
      value({...sources, router: sources.router.path(path)})
    )
    .shareReplay(1)

  return ['DOM', 'auth$', 'queue$', 'route$']
    .reduce((a,k) =>
      (a[k] = comp$.map(c => c[k] || never()).switch().share()) && a
    , {})
}
