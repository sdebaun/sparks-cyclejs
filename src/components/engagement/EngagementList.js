import {Observable} from 'rx'
const {just} = Observable

import {List, ListItemNavigating} from 'components/sdm'

import {
  ProjectImages,
} from 'components/remote'

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

const EngagementItem = sources => {
  const projectImage$ = sources.item$.map(e => e.opp.projectKey)
    .flatMapLatest(ProjectImages.query.one(sources))

  return ListItemNavigating({...sources,
    iconSrc$: projectImage$.map(i => i && i.dataUrl),
    title$: sources.item$.map(e => e.opp.project.name),
    subtitle$: sources.item$.map(e => e.opp.name + ' | ' + _label(e)),
    path$: sources.item$.map(({$key}) => '/engaged/' + $key),
  })
}

const EngagementList = sources => List({...sources,
  Control$: just(EngagementItem),
})

export {EngagementList}
