import {Observable} from 'rx'
const {combineLatest} = Observable

import {ProjectItem} from 'components/project'
import {Opps, Projects} from 'components/remote'

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

const _Fetch = sources => {
  const opp$ = sources.item$.pluck('oppKey')
    .tap(x => console.log('oppKey', x))
    .flatMapLatest(Opps.query.one(sources))
  const project$ = opp$.pluck('projectKey')
    .tap(x => console.log('projectKey', x))
    .flatMapLatest(Projects.query.one(sources))
    .combineLatest(
      opp$.pluck('projectKey'),
      (p, $key) => ({$key, ...p})
    )
  return {
    opp$,
    project$,
  }
}

const EngagementItem = sources => {
  const _sources = {...sources, ..._Fetch(sources)}
  return ProjectItem({..._sources,
    subtitle$: combineLatest(
      _sources.item$, _sources.opp$,
      (e,opp) => opp.name + ' | ' + _label(e)
    ),
    item$: _sources.project$,
    path$: _sources.item$.map(({$key}) => '/engaged/' + $key),
  })
}

export {EngagementItem}
