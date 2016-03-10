import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'

// import {div,h} from 'cycle-snabbdom'
// import {Col, Row} from 'snabbdom-material'
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
    // ListItem(
    //   {attrs: {'data-link': '/project/' + project.$key + '/staff'}},
    //   [icon('person_add','black'),'Invite More Admins to Help']
    // ),
  )

export default sources => {
  const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)

  const viewState = {
    project$: sources.project$,
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM}
}
