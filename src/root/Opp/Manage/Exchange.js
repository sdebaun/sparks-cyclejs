import {Observable} from 'rx'
const {merge} = Observable

import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {AddCommitmentGive, AddCommitmentGet} from 'components/opp'
import {Commitments} from 'components/remote'

import {div} from 'helpers'

import {CommitmentList} from 'components/commitment'

const _render = ({addGiveDOM, giveListDOM, addGetDOM, getListDOM}) =>
  div({}, [
    addGiveDOM,
    giveListDOM,
    addGetDOM,
    getListDOM,
  ])

export default sources => {
  const commitments$ = sources.oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const gives$ = commitments$.map(rows => rows.filter(r => r.party === 'vol'))
  const gets$ = commitments$.map(rows => rows.filter(r => r.party === 'org'))

  const giveList = CommitmentList({...sources, rows$: gives$}, 'give')
  const getList = CommitmentList({...sources, rows$: gets$}, 'get')

  const addGive = isolate(AddCommitmentGive)(sources)
  const addGet = isolate(AddCommitmentGet)(sources)

  const commitment$ = Observable.merge(
    addGive.commitment$,
    addGet.commitment$,
  )

  const createQueues$ = commitment$
    .combineLatest(sources.oppKey$, (action,oppKey) => ({...action, oppKey}))
    .map(Commitments.action.create)

  const itemQueues$ = merge(
    giveList.queue$,
    getList.queue$,
  )

  const queue$ = merge(
    createQueues$,
    itemQueues$,
  )

  const viewState = {
    addGiveDOM: addGive.DOM,
    giveListDOM: giveList.DOM,
    addGetDOM: addGet.DOM,
    getListDOM: getList.DOM,
  }

  queue$.subscribe(x => console.log('opp queue', x))

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    queue$,
  }
}
