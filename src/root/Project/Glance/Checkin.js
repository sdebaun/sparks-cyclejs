import {Observable as $} from 'rx'

import {
  InputControl,
} from 'components/sdm'

import {
  Assignments,
  Shifts,
  Profiles,
} from 'components/remote'

import {log} from 'util'

const SearchForm = sources =>
  InputControl({...sources,
    label$: $.just('test'),
  })

const _Fetch = sources => {
  const assignmentsByOpp$ = sources.opps$
    .map(opps => opps.map(o => Assignments.query.byOpp(sources)(o.$key)))
    .flatMapLatest(arrayAssignQueries => $.combineLatest(arrayAssignQueries))

  assignmentsByOpp$.subscribe(log('assignmentsByOpp$'))

  const assignmentsOnly$ = assignmentsByOpp$
    .map(assignments => [].concat.apply([],assignments))

  assignmentsOnly$.subscribe(log('assignmentsOnly$'))

  const assignments$ = assignmentsOnly$
    .map(amnts => amnts.filter(a => a.profileKey && a.shiftKey).map(amnt =>
      $.combineLatest(
        Shifts.query.one(sources)(amnt.shiftKey),
        Profiles.query.one(sources)(amnt.profileKey),
        (shift, profile) => ({...amnt, shift, profile})
      )
    ))
    .flatMapLatest(amntQueries => $.combineLatest(amntQueries))

  assignments$.subscribe(log('assignments$'))

  return {
    assignments$,
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
