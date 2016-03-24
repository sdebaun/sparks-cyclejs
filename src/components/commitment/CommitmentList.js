import {Observable} from 'rx'
const {just} = Observable
// import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import {div} from 'helpers'

import {Commitments} from 'components/remote'
import {mergeOrFlatMapLatest, controlsFromRows} from 'util'

import {MenuItem, ListItemWithMenu} from 'components/sdm'

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

const CommitmentList = sources => {
  const controls$ = sources.commitments$
    .map(commitments => controlsFromRows(sources, commitments, CommitmentItem))

  const children$ = controls$
    .map(controls => controls.map(c => c.DOM))

  const DOM = children$.map(children => div({}, children))

  const queue$ = controls$.flatMapLatest(children =>
    mergeOrFlatMapLatest('queue$', ...children)
  )

  return {
    DOM,
    queue$,
  }
}

export {CommitmentItem, CommitmentList}
