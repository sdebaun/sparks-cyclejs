import {Observable, BehaviorSubject} from 'rx'
const {just, combineLatest} = Observable
// import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import {Commitments} from 'components/remote'

import {List, ListItemWithMenu, MenuItem} from 'components/sdm'

import codeIcons from 'components/opp/codeIcons'
import codeTitles from 'components/opp/codeTitles'
import codePopups from 'components/opp/codePopups'

import {div} from 'cycle-snabbdom'

const Delete = sources => MenuItem({...sources,
  iconName$: just('remove'),
  title$: just('Remove'),
})

const Edit = sources => isolate(MenuItem, 'edit')({
  ...sources,
  iconName$: just('pencil'),
  title$: just('Edit'),
})

const CommitmentItem = sources => {
  const item$ = sources.item$.shareReplay(1)

  const deleteItem = isolate(Delete,'delete')(sources)
  const editItem = Edit(sources)

  const code$ = item$.pluck('code')

  const listItem = ListItemWithMenu({...sources,
    iconName$: code$.map(code => codeIcons[code]),
    title$: item$.map(({code, ...vals}) => codeTitles[code](vals)),
    menuItems$: just([deleteItem.DOM, editItem.DOM]),
  })

  const edit$ = editItem.click$
    .flatMapLatest(code$)
    .map(code => {
      const isOpen$ = new BehaviorSubject(true)
      const sinks = codePopups[code]({...sources, isOpen$})
      sinks.submit$
        .map(false)
        .takeUntil(deleteItem.click$)
        .subscribe(isOpen$.asObserver())
      return {...sinks, item$: sinks.item$.map(i => ({...i, code}))}
    }).share()

  const editDOM$ = edit$.pluck('modalDOM')

  // TODO: merge with queue$
  // const editQueue$ = edit$.pluck('item$')
  //  ^^ needs to be merged with the queue$, but I don't know how to
  // 'update' things with firebase

  const queue$ = deleteItem.click$
    .flatMapLatest(item$)
    .pluck('$key')
    .map(Commitments.action.remove)

  const DOM = combineLatest(
    listItem.DOM, editDOM$.startWith(null),
    (...doms) => div({}, doms)
  )

  return {
    DOM,
    queue$,
  }
}

const CommitmentList = sources => List({...sources,
  Control$: just(CommitmentItem),
})

export {CommitmentItem, CommitmentList}
