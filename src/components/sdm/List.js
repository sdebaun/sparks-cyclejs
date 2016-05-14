import {Observable} from 'rx'
const {just} = Observable

import {div} from 'helpers'
import {requireSources, mergeOrFlatMapLatest, controlsFromRows} from 'util'

import {combineDOMsToDiv} from 'util'

export const PartialList = sources => {
  requireSources('List', sources, 'rows$', 'Control$')

  const controls$ = sources.rows$
    // .tap(x => console.count(x))
    .flatMapLatest(rows =>
      sources.Control$.map(Control =>
        controlsFromRows(sources, rows, Control)
      )
    )
    .shareReplay(1)

  const contents$ = controls$.map(ctrls => ctrls.map(ctrl => ctrl.DOM))
    // .map(controls => controls.length > 0 ?
    //   combineDOMsToDiv('', ...controls) :
    //   just(div([]))
    // ).switch()

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

  const assignment$ = controls$.flatMapLatest(c =>
    mergeOrFlatMapLatest('assignment$', ...c)
  )

  const date$ = controls$.flatMapLatest(c =>
    mergeOrFlatMapLatest('date$', ...c)
  )

  return {
    contents$,
    queue$,
    route$,
    edit$,
    lastIndex$,
    assignment$,
    date$,
  }
}

export const List = sources => {
  requireSources('List', sources, 'rows$', 'Control$')

  const controls$ = sources.rows$
    // .tap(x => console.count(x))
    .flatMapLatest(rows =>
      sources.Control$.map(Control =>
        controlsFromRows(sources, rows, Control)
      )
    )
    .shareReplay(1)

  const DOM = controls$
    .map(controls => controls.length > 0 ?
      combineDOMsToDiv('', ...controls) :
      just(div([]))
    ).switch()

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

  const assignment$ = controls$.flatMapLatest(c =>
    mergeOrFlatMapLatest('assignment$', ...c)
  )

  const date$ = controls$.flatMapLatest(c =>
    mergeOrFlatMapLatest('date$', ...c)
  )

  return {
    DOM,
    queue$,
    route$,
    edit$,
    lastIndex$,
    assignment$,
    date$,
  }
}

export const ListWithHeader = sources => {
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

// export {
//   List,
//   ListWithHeader,
// }
