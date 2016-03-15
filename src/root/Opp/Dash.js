import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'
import CreateTeam from 'components/CreateTeam'

import listItemDisabled from 'helpers/listItemDisabled'

import {col} from 'helpers'

const _render = ({project, reateOrganizerInviteDOM, createTeamDOM}) =>
  col(
    listItemDisabled(
      {iconName: 'playlist_add', title: 'What\'s this opportunity all about?'}
    ),
    listItemDisabled(
      {iconName: 'balance-scale',
      title: 'What\'s the Energy Exchange you\'re offering?'}
    ),
    listItemDisabled(
      {iconName: 'calendar2',
      title: 'Which Teams can volunteers pick their shifts from?'}
    ),
    // createTeamDOM,
    // createOrganizerInviteDOM,
  )

const byMatch = (matchDomain,matchEvent) =>
  ({domain,event}) => domain === matchDomain && event === matchEvent

const _responseRedirects$ = ({responses$, router: {createHref}}) =>
  Observable.merge(
    responses$.filter(byMatch('Organizers','create'))
      .map(response => createHref('/staff')),
    responses$.filter(byMatch('Teams','create'))
      // not createHref - /team is off root of site
      .map(response => '/team/' + response.payload),
  )

export default sources => {
  const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)
  const createTeam = isolate(CreateTeam)(sources)

  const queue$ = Observable.merge(
    createOrganizerInvite.queue$,
    createTeam.queue$,
  )

  const route$ = _responseRedirects$(sources)

  const viewState = {
    project$: sources.project$,
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
    createTeamDOM$: createTeam.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, queue$, route$}
}
