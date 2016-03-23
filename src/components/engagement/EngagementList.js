import {NavClicker} from 'components'
import listItem from 'helpers/listItem'
import {div} from 'cycle-snabbdom'

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

const EngagementList = sources => ({
  route$: NavClicker(sources).route$,

  DOM: sources.engagements$.map(engagements =>
    div({}, engagements.map(({$key,opp,...eng}) =>
      listItem({
        title: opp.project.name, subtitle: opp.name + ' | ' + _label(eng),
        link: '/engaged/' + $key, className: 'engagement.nav',
      })
    ))
  ),
})

export {EngagementList}
