import {div} from 'helpers'
import {mergeOrFlatMapLatest, controlsFromRows} from 'util'

const List = sources => {
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

  return {
    DOM,
    queue$,
    route$,
  }
}

const ListWithHeader = sources => {
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
  }
}

export {
  List,
  ListWithHeader,
}
