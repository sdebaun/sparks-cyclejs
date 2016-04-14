import {Observable} from 'rx'
const {combineLatest} = Observable

import {div} from 'helpers'
import {requireSources, mergeOrFlatMapLatest, controlsFromRows} from 'util'

const List = sources => {
  requireSources('List', sources, 'rows$', 'Control$')

  const controls$ = sources.rows$
    .tap(x => console.count(x))
    .flatMapLatest(rows =>
      sources.Control$.map(Control =>
        controlsFromRows(sources, rows, Control)
      )
    )
    // .replay(null, 1)
    .shareReplay(1)
    // ).share() // lots of repeat nav breaks with this

  // controls$.connect()

    // .share == .publish.refCount
    // .publish == .multiCast(=>new subject)
    // .refcount: tracks # of observers
    // .shareReplay == multicasts to a replaysubject
    // .publishBehavior? multicasts to a behavior

  const children$ = controls$
    .map(controls => controls.map(c => c.DOM))
    .map(children => combineLatest(...children, (...doms) => doms))
    .switch()

  const DOM = children$.map(children => div({}, children))
    .shareReplay(1)

  const route$ = controls$.flatMapLatest(children =>
    mergeOrFlatMapLatest('route$', ...children)
  )

  const queue$ = controls$.flatMapLatest(children =>
    mergeOrFlatMapLatest('queue$', ...children)
  )

  const edit$ = controls$.flatMapLatest(children =>
    mergeOrFlatMapLatest('edit$', ...children)
  )

  const lastIndex$ = controls$.flatMapLatest(children =>
    mergeOrFlatMapLatest('lastIndex$', ...children)
  )

  return {
    DOM,
    queue$,
    route$,
    edit$,
    lastIndex$,
  }
}

const ListWithHeader = sources => {
  requireSources('ListWithHeader', sources, 'rows$', 'headerDOM')

  const list = List(sources)

  const DOM = sources.rows$.combineLatest(
    sources.headerDOM,
    list.DOM,
    (rows, ...doms) =>
      div({}, rows.length > 0 ? doms : []),
  )

  return {
    DOM,
    route$: list.route$,
    queue$: list.queue$,
  }
}

export {
  List,
  ListWithHeader,
}
