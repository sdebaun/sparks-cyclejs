import {pluckLatest, pluckLatestOrNever} from 'util'
import isolate from '@cycle/isolate'

const SwitchedComponent = sources => {
  const comp$ = sources.Component$
    .distinctUntilChanged()
    .map(C => isolate(C)(sources))
    .shareReplay(1)

  return {
    pluck: key => pluckLatestOrNever(key, comp$),
    DOM: pluckLatest('DOM', comp$),
    ...['auth$', 'queue$', 'route$'].reduce((a,k) =>
      (a[k] = pluckLatestOrNever(k,comp$)) && a, {}
    ),
  }
}

export {SwitchedComponent}
