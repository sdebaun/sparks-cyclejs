import {Observable} from 'rx'
import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {AddCommitmentGive, AddCommitmentGet} from 'components/opp'
import {Commitments} from 'components/remote'

import {div} from 'helpers'
import listItem from 'helpers/listItem'

const _render = ({addGiveDOM, giveListDOM, addGetDOM, getListDOM}) =>
  div({}, [
    addGiveDOM,
    giveListDOM,
    addGetDOM,
    getListDOM,
  ])

const CommitmentList = sources => ({
  DOM: sources.commitments$.map(rows =>
    div({}, rows.map(({$key}) =>
      listItem(
        {title: $key, className: 'commitment', clickable: true}
      )
    ))
  ),
})

export default sources => {
  const commitments$ = sources.oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const gives$ = commitments$.map(rows => rows.filter(r => r.party === 'vol'))
  const gets$ = commitments$.map(rows => rows.filter(r => r.party === 'org'))

  const giveList = CommitmentList({...sources, commitments$: gives$})
  const getList = CommitmentList({...sources, commitments$: gets$})

  const addGive = isolate(AddCommitmentGive)(sources)
  const addGet = isolate(AddCommitmentGet)(sources)

  const queue$ = Observable.merge(
    addGive.queue$,
    addGet.queue$,
  )

  const viewState = {
    addGiveDOM: addGive.DOM,
    giveListDOM: giveList.DOM,
    addGetDOM: addGet.DOM,
    getListDOM: getList.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    queue$,
  }
}
