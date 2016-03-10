import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'

import listItem from 'helpers/listItem'

import {col, icon} from 'helpers'

const _render = ({project, createOrganizerInviteDOM}) =>
  col(
    listItem({
      iconName: 'playlist_add',
      title: 'What\'s your project all about?',
      link: '/project/' + project.$key + '/manage',
    }),
    listItem({
      iconName: 'group_add',
      title: 'Build Your First Team',
    }),
    listItem({
      iconName: 'power',
      title: 'Create a Volunteer Opportunity',
    }),
    createOrganizerInviteDOM,
  )

export default sources => {
  const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)

  const queue$ = createOrganizerInvite.queue$

  const viewState = {
    project$: sources.project$,
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, queue$}
}
