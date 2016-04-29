import {Observable as $} from 'rx'

import {
  InputControl,
} from 'components/sdm'

import {
  Assignments,
} from 'components/remote'

import {log} from 'util'

const SearchForm = sources =>
  InputControl({...sources,
    label$: $.just('test'),
  })

const _Fetch = sources => {
  const assignmentQueries$ = sources.opps$
    .map(opps => opps.map(o => Assignments.query.byOpp(sources)(o.$key)))
    // .map(opps => opps.map(o => $.just([1,2,3])))
    .tap(log('assignmentQueries$'))

  // const assignments$ = $.combineLatest(
  //   ...assignmentQueries$,
  //   log('assignments$ via cL'),
  // )
  // const assignments$ = $.forkJoin(
  //   assignmentQueries$,
  //   log('assignmentQueries$'),
  // )
  // const assignments$ = $.forkJoin(assignmentQueries$)
  // const x$ = $.zip(...assignmentQueries$, (...args) => args)
  // const x$ = $.combineLatest(assignmentQueries$)
  // const x$ = $.combineLatest(assignmentQueries$, (...args) => args)

  const x$ = assignmentQueries$
    // .flatMapLatest(arrayAssignQueries => $.forkJoin(arrayAssignQueries))
    .flatMapLatest(arrayAssignQueries => $.combineLatest(arrayAssignQueries))
  // const x$ = $.zipIterable(assignmentQueries$)
  // const x$ = assignmentQueries$.zipIterable()

  x$.subscribe(log('assignments$'))


  return {
    x$,
  }
}

export default _sources => {
  const sources = {..._sources, ..._Fetch(_sources)}
  // const sources = _sources

  const sf = SearchForm(sources)

  const debounced$ = sf.value$.debounce(1000)

  debounced$.subscribe(log('sf.value$'))

  return {
    DOM: sf.DOM,
  }
}
