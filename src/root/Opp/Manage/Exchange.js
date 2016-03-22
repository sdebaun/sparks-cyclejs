import {Observable} from 'rx'
const {just, merge, empty} = Observable

import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {AddCommitmentGive, AddCommitmentGet} from 'components/opp'
import {Commitments} from 'components/remote'

import {div} from 'helpers'
import listItem from 'helpers/listItem'
import menuItem from 'helpers/menuItem'

import codeIcons from 'components/opp/codeIcons'
import codeTitles from 'components/opp/codeTitles'

import {DropdownMenu} from 'components/DropdownMenu'

import {log} from 'util'

const _render = ({addGiveDOM, giveListDOM, addGetDOM, getListDOM}) =>
  div({}, [
    addGiveDOM,
    giveListDOM,
    addGetDOM,
    getListDOM,
  ])

const CommitmentItem = sources => {
  const openClick$ = sources.DOM.select('.commitment').events('click')

  const isOpen$ = openClick$.map(true)
    .startWith(false)

  const menuItems = just([
    // menuItem({title: 'Edit', iconName: 'pencil', className: 'edit', clickable: true}),
    menuItem({title: 'Delete', iconName: 'remove', className: 'delete', clickable: true}),
  ])

  const deleteClick$ = sources.DOM.select('.delete').events('click')
  const editClick$ = sources.DOM.select('.edit').events('click')

  const dropdown = DropdownMenu({...sources, isOpen$, children$: menuItems})

  const queue$ = sources.item$
    .sample(deleteClick$)
    .map(({$key}) => Commitments.action.remove($key))

  queue$.subscribe(log('CI/queue$'))

  const DOM = sources.item$.map(({code, ...vals}) =>
    div({},[
      listItem({
        title: codeTitles[code](vals),
        iconName: codeIcons[code],
        className: 'commitment',
        clickable: true,
      }),
      dropdown.DOM,
    ])
  )

  return {
    DOM,
    queue$,
  }
}

const CommitmentList = sources => {
  const children$ = sources.commitments$
  .distinctUntilChanged()
  .map(rows =>
    rows.map(row => isolate(CommitmentItem)({item$: just(row), ...sources}))
    // rows.map(row => CommitmentItem({item$: just(row), ...sources}))
  )

  children$.subscribe(log('children$'))

  const DOM = children$.map(children =>
    div({},children.map(c => c.DOM))
  )
  const queue$ = children$.flatMapLatest(children =>
  //   // merge(...children.map(c => c.queue$))
    merge(...children.map(c => c.queue$))
  )
  // const childQueues$ = children$
  //   .map(children => children
  //     .map(c => c.queue$.subscribe(log('child.queue2')) && c.queue$)
  //   )

  // childQueues$.subscribe(log('CL/childQueues$'))
  // childQueues$.subscribe(queues =>
  //   queues.forEach(q => q.subscribe(log('child.queue$')))
  // )

  // const queue$ = childQueues$
  //   .flatMapLatest(queues => merge(...queues))

  // children$.flatMapLatest(cs => cs.map(c => c.queue$))

  queue$.subscribe(log('CL/queue$'))

  return {
    DOM,
    // queue$,
    queue$: empty(),
  }
}

export default sources => {
  const commitments$ = sources.oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const gives$ = commitments$.map(rows => rows.filter(r => r.party === 'vol'))
  const gets$ = commitments$.map(rows => rows.filter(r => r.party === 'org'))

  const giveList = CommitmentList({...sources, commitments$: gives$})
  const getList = CommitmentList({...sources, commitments$: gets$})

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

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    queue$,
  }
}
