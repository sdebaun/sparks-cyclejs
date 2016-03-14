import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'
import CreateTeam from 'components/CreateTeam'

import listItem from 'helpers/listItem'
import listItemDisabled from 'helpers/listItemDisabled'

import {col, icon} from 'helpers'

import {log, rows} from 'util'

const _render = ({project, teams, organizers, createOrganizerInviteDOM, createTeamDOM}) =>
  col(
    listItemDisabled({iconName: 'playlist_add', title: 'What\'s your project all about?'}),
    rows(teams).length === 0 ? createTeamDOM : null,
    rows(organizers).length === 0 ? createOrganizerInviteDOM : null,
    listItemDisabled({iconName: 'power', title: 'Create a volunteer Opportunity.'}),
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
    teams$: sources.teams$,
    organizers$: sources.organizers$,
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
    createTeamDOM$: createTeam.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, queue$, route$}
}
