import {Observable} from 'rx'
const {empty} = Observable
import {div} from 'helpers'
// import {log} from 'util'

const pluckLatest = (k,s$) => s$.pluck(k).switch()

const pluckLatestOrNever = (k,s$) =>
  s$.map(c => c[k] || empty()).switch()

export const RoutedComponent = sources => {
  const comp$ = sources.routes$
    .map(routes => sources.router.define(routes))
    .switch()
    .distinctUntilChanged(({path}) => path)
    .map(({path, value}) =>
      value({...sources, router: sources.router.path(path)})
    )
    .shareReplay(1)

  return {
    pluck: key => pluckLatestOrNever(key, comp$),
    DOM: pluckLatest('DOM', comp$) //,
      .startWith(div('.loading',['Loading...'])),
    ...['auth$', 'queue$', 'route$'].reduce((a,k) =>
      (a[k] = pluckLatestOrNever(k,comp$)) && a, {}
    ),
  }
}
