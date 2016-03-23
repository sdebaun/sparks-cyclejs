import {Observable} from 'rx'
const {just, merge} = Observable

import isolate from '@cycle/isolate'
import combineLatestObj from 'rx-combine-latest-obj'
import {AddCommitmentGive, AddCommitmentGet} from 'components/opp'
import {Commitments} from 'components/remote'

import {div} from 'helpers'
import listItem from 'helpers/listItem'
import menuItem from 'helpers/menuItem'

import codeIcons from 'components/opp/codeIcons'
import codeTitles from 'components/opp/codeTitles'

import {Menu} from 'components/sdm'

import {mergeOrFlatMapLatest} from 'util'

const _render = ({addGiveDOM, giveListDOM, addGetDOM, getListDOM}) =>
  div({}, [
    addGiveDOM,
    giveListDOM,
    addGetDOM,
    getListDOM,
  ])

const CommitmentItem = (sources, className) => {
  const openClick$ = sources.DOM
    .select(`.${className}`)
    .select('.commitment')
    .events('click')

  const isOpen$ = openClick$.map(true)
    .startWith(false)

  const menuItems = just([
    /*menuItem({
      title: 'Edit',
      iconName: 'pencil',
      className: 'edit',
      clickable: true}),*/
    menuItem({
      title: 'Delete',
      iconName: 'remove',
      className: 'delete',
      clickable: true}),
  ])

  const queue$ = sources.DOM.select(`.${className}`).select('.delete').events('click')
    .flatMapLatest(() => sources.item$)
    .pluck('$key')
    .map(Commitments.action.remove)

  const dropdown = Menu({...sources, isOpen$, children$: menuItems})

  const DOM = sources.item$.map(({code, ...vals}) =>
    div({props: {className}},[
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

const createItem = (sources, name) => rows =>
  rows.map(
    (row, i) => CommitmentItem({item$: just(row), ...sources}, `${name}-${i}`)
  )

const CommitmentList = (sources, name) => {
  const children$ = sources.commitments$
    .map(createItem(sources, name))

  const DOM = children$.map(children =>
    div({}, children.map(c => c.DOM))
  )

  const queue$ = children$.flatMapLatest(children =>
    mergeOrFlatMapLatest('queue$', ...children)
  )

  return {
    DOM,
    queue$,
  }
}

export default sources => {
  const commitments$ = sources.oppKey$
    .flatMapLatest(Commitments.query.byOpp(sources))

  const gives$ = commitments$.map(rows => rows.filter(r => r.party === 'vol'))
  const gets$ = commitments$.map(rows => rows.filter(r => r.party === 'org'))

  const giveList = CommitmentList({...sources, commitments$: gives$}, 'give')
  const getList = CommitmentList({...sources, commitments$: gets$}, 'get')

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
