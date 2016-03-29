import {Observable} from 'rx'
const {just, combineLatest} = Observable
// import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import {Commitments} from 'components/remote'

import {List, ListItemWithMenu, MenuItem} from 'components/sdm'

import codeIcons from 'components/opp/codeIcons'
import codeTitles from 'components/opp/codeTitles'
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
  const item$ = sources.item$

  const deleteItem = isolate(Delete,'delete')(sources)
  const editItem = Edit(sources)

  const listItem = ListItemWithMenu({...sources,
    iconName$: item$.map(({code}) => codeIcons[code]),
    title$: item$.map(({code, ...vals}) => codeTitles[code](vals)),
    menuItems$: just([deleteItem.DOM, editItem.DOM]),
  })

  const edit$ = editItem.click$
    .flatMapLatest(item$)

  const queue$ = deleteItem.click$
    .flatMapLatest(item$)
    .pluck('$key')
    .map(Commitments.action.remove)

  const DOM = combineLatest(
    listItem.DOM,
    (...doms) => div({}, doms)
  )

  return {
    DOM,
    queue$,
    edit$,
  }
}

const CommitmentList = sources => List({...sources,
  Control$: just(CommitmentItem),
})

export {CommitmentItem, CommitmentList}
