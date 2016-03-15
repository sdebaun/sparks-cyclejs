import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'
import CreateTeam from 'components/CreateTeam'

import listItemDisabled from 'helpers/listItemDisabled'

import {col} from 'helpers'

// import {log} from 'util'

// const _render = ({project, createOrganizerInviteDOM, createTeamDOM}) =>
const _render = () =>
  col(
    listItemDisabled(
      {iconName: 'playlist_add', title: 'What\'s this team all about?'}
    ),
    listItemDisabled(
      {iconName: 'person_add',
      title: 'Invite some people to help Lead this team.'}
    ),
    listItemDisabled(
      {iconName: 'bullhorn', title: 'How are you recruiting volunteers?'}
    ),
  )

const byMatch = (matchDomain,matchEvent) =>
  ({domain,event}) => domain === matchDomain && event === matchEvent

const _responseRedirects$ = ({responses$, router: {createHref}}) =>
  Observable.merge(
    responses$.filter(byMatch('Organizers','create'))
      .map(() => createHref('/staff')),
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
