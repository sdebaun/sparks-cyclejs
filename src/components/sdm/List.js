import {Observable as $} from 'rx'
const {just} = $

import {always, filter, ifElse, isEmpty} from 'ramda'
import {div} from 'helpers'
import {requireSources, mergeOrFlatMapLatest, controlsFromRows} from 'util'

import {combineDOMsToDiv} from 'util'

export const PartialList = sources => {
  requireSources('List', sources, 'rows$', 'Control$')

  const controls$ = sources.rows$
  .flatMapLatest(
    ifElse(
      isEmpty,
      () => just([{DOM: sources.emptyDOM$ || div('.empty', {}, '')}]),
      rows => sources.Control$.map(controlsFromRows(sources, rows))
    ))
    .shareReplay(1)

  const contents$ = controls$.map(ctrls => ctrls.map(ctrl => ctrl.DOM))

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
    .flatMapLatest(
      ifElse(
        isEmpty,
        () => just([{DOM: sources.emptyDOM$ || div('.empty', {}, '')}]),
        rows => sources.Control$.map(controlsFromRows(sources, rows))
      ))
    .tap(ctrls => console.log('ctrls', ctrls))
    .shareReplay(1)

  const DOM = controls$
    .map(controls => controls.length > 0 ?
      combineDOMsToDiv('', ...controls) :
      just(div('',[]))
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

  const DOM = $.combineLatest(
    sources.headerDOM,
    list.DOM,
    (...doms) => div({}, doms),
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
