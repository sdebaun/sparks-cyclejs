import {Observable} from 'rx'
const {just} = Observable
// import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import {Commitments} from 'components/remote'

import {List, ListItemWithMenu, MenuItem} from 'components/sdm'

import codeIcons from 'components/opp/codeIcons'
import codeTitles from 'components/opp/codeTitles'

const Delete = sources => MenuItem({...sources,
  iconName$: just('remove'),
  title$: just('Remove'),
})

const CommitmentItem = sources => {
  const deleteItem = isolate(Delete,'delete')(sources)

  const listItem = ListItemWithMenu({...sources,
    iconName$: sources.item$.map(({code}) => codeIcons[code]),
    title$: sources.item$.map(({code, ...vals}) => codeTitles[code](vals)),
    menuItems$: just([deleteItem.DOM]),
  })

  const queue$ = deleteItem.click$
    .flatMapLatest(sources.item$)
    .pluck('$key')
    .map(Commitments.action.remove)

  return {
    DOM: listItem.DOM,
    queue$,
  }
}

const CommitmentList = sources => List({...sources,
  Control$: just(CommitmentItem),
})

export {CommitmentItem, CommitmentList}
