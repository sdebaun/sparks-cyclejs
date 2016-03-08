import {Observable} from 'rx'

export const log = label => emitted => console.log(label,':',emitted)

export const isObservable = obs => typeof obs.subscribe === 'function'

export function nestedComponent({path$, value$}, sources) {
  return path$.zip(value$,
    (path, value) => value({...sources, router: sources.router.path(path)})
  ).shareReplay(1)
}

export const mergeOrFlatMapLatest = (prop, ...sourceArray) =>
  Observable.merge(
    sourceArray.map(src => // array.map!
      isObservable(src) ? // flatmap if observable
        src.flatMapLatest(l => l[prop] || Observable.empty()) :
        // otherwise look for a prop
        src[prop] || Observable.empty()
    )
  )
