import {Observable, Subject} from 'rx'
const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {AddCommitmentGive, AddCommitmentGet} from 'components/opp'
import codePopups from 'components/opp/codePopups'
import {Commitments} from 'components/remote'

import {div} from 'helpers'

import {CommitmentList} from 'components/commitment'

function buildEditForm(giveList, getList, sources) {
  const edit$ = merge(giveList.edit$, getList.edit$)
    .map(({code, $key, party, ...others}) => {
      const objectKey = Object.keys(others)
        .filter(k => k !== 'code' && k !== 'oppKey')[0]
      const value = others[objectKey]
      const popup = codePopups[code]({
        isOpen$: just(true),
        value$: just(value),
        ...sources,
      })

      return {
        code,
        party,
        objectKey,
        key: $key,
        item: popup.item$,
        submit: popup.submit$,
        modalDOM: popup.modalDOM,
      }
    }).share()

  const editItem$ = edit$.pluck('item').switch()
  const submit$ = edit$.pluck('submit').switch()

  const editQueue$ = editItem$.sample(submit$)
    .withLatestFrom(edit$, sources.oppKey$,
      (item, {code, key, party, objectKey}, oppKey) => {
        let object = {key, values: {code, party, oppKey}}
        object.values[objectKey] = item[objectKey]
        return object
      })
    .map(Commitments.action.update)

  const modalDOM = merge(
    edit$.pluck('modalDOM').switch().startWith(null),
    submit$.map(null),
  )

  return {modalDOM, editQueue$}
}

export default sources => {
  const commitments$ = sources.oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const gives$ = commitments$.map(rows => rows.filter(r => r.party === 'vol'))
  const gets$ = commitments$.map(rows => rows.filter(r => r.party === 'org'))

  const giveList = CommitmentList({...sources, rows$: gives$})
  const getList = CommitmentList({...sources, rows$: gets$})

  const {modalDOM, editQueue$} = buildEditForm(giveList, getList, sources)

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
    editQueue$,
  )

  const DOM = combineLatest(
    addGive.DOM, giveList.DOM,
    addGet.DOM, getList.DOM,
    modalDOM,
    (...doms) => div({}, doms)
  )

  return {
    DOM,
    queue$,
  }
}
