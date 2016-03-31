import {div} from 'helpers'
import {requireSources, mergeOrFlatMapLatest, controlsFromRows} from 'util'

const List = sources => {
  requireSources('List', sources, 'rows$', 'Control$')

  const controls$ = sources.rows$
    .flatMapLatest(rows =>
      sources.Control$.map(Control =>
        controlsFromRows(sources, rows, Control)
      )
    )

  const children$ = controls$
    .map(controls => controls.map(c => c.DOM))

  const DOM = children$.map(children => div({}, children))

  const route$ = controls$.flatMapLatest(children =>
    mergeOrFlatMapLatest('route$', ...children)
  )

  const queue$ = controls$.flatMapLatest(children =>
    mergeOrFlatMapLatest('queue$', ...children)
  )

  const edit$ = controls$.flatMapLatest(children =>
    mergeOrFlatMapLatest('edit$', ...children)
  )

  return {
    DOM,
    queue$,
    route$,
    edit$,
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
