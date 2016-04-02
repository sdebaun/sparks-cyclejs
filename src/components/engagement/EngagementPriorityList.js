// TODO: TLC

import combineLatestObj from 'rx-combine-latest-obj'
import listItem from 'helpers/listItem'
import {div} from 'cycle-snabbdom'
import {NavClicker} from 'components'

const EngagementPriorityList = sources => {
  const viewState = {
    oppAnswer$: sources.engagement$.pluck('answer'),
  }

  const DOM = combineLatestObj(viewState)
    .map(({oppAnswer}) =>
      div({},[
        !oppAnswer ? listItem({title: 'Opp answer'}) : null,
      ])
    )

  const route$ = NavClicker(sources).route$

  return {
    DOM,
    route$,
  }
}

export {EngagementPriorityList}
