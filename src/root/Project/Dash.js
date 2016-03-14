import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'
import CreateTeam from 'components/CreateTeam'

import listItem from 'helpers/listItem'

import {col, icon} from 'helpers'

import {log} from 'util'

const _render = ({project, createOrganizerInviteDOM, createTeamDOM}) =>
  col(
    // listItem({
    //   iconName: 'playlist_add',
    //   title: 'What\'s your project all about?',
    //   link: '/project/' + '/manage',
    // }),
    // listItem({
    //   iconName: 'group_add',
    //   title: 'Build Your First Team',
    // }),
    // listItem({
    //   iconName: 'power',
    //   title: 'Create a Volunteer Opportunity',
    // }),
    createTeamDOM,
    createOrganizerInviteDOM,
  )

const byMatch = (matchDomain,matchEvent) =>
  ({domain,event}) => domain === matchDomain && event === matchEvent

const _responseRedirects$ = ({responses$, router: {createHref}}) =>
  Observable.merge(
    responses$.filter(byMatch('Organizers','create'))
      .map(response => createHref('/staff')),
    responses$.filter(byMatch('Teams','create'))
      .map(response => createHref('/team/' + response.payload)),
  )

export default sources => {
  const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)
  const createTeam = isolate(CreateTeam)(sources)

  const queue$ = Observable.merge(
    createOrganizerInvite.queue$,
    createTeam.queue$,
  )

  const route$ = _responseRedirects$(sources)

  route$.subscribe(log('route$'))

  const viewState = {
    project$: sources.project$,
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
    createTeamDOM$: createTeam.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, queue$, route$}
}
