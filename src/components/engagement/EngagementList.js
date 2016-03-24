import {Observable} from 'rx'
const {just} = Observable

// import {NavClicker} from 'components'
// import listItem from 'helpers/listItem'
// import {div} from 'cycle-snabbdom'

import {List, ListItemNavigating} from 'components/sdm'

// import {mergeOrFlatMapLatest, controlsFromRows} from 'util'

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

const EngagementItem = sources => ListItemNavigating({...sources,
  title$: sources.item$.map(e => e.opp.project.name),
  subtitle$: sources.item$.map(e => e.opp.name + ' | ' + _label(e)),
  path$: sources.item$.map(({$key}) => '/engaged/' + $key),
})

const EngagementList = sources => List({...sources,
  Control$: just(EngagementItem),
})

export {EngagementList}
