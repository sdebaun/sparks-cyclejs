import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'

import listItem from 'helpers/listItem'
import listHeader from 'helpers/listHeader'

import {col, icon} from 'helpers'

import {log} from 'util'

const _renderOrganizerInvite = ({inviteEmail, authority}) =>
  listItem({
    iconName: 'mail_outline',
    title: inviteEmail,
    subtitle: authority,
  })

const _render = ({project, organizers, createOrganizerInviteDOM}) =>
  col(
    createOrganizerInviteDOM,
    listHeader({title: 'Open Invites'}),
    ...organizers.map(o => _renderOrganizerInvite(o))
  )

import {rows} from 'util'

export default sources => {
  const organizers$ = sources.projectKey$
    .flatMapLatest(projectKey =>
      sources.firebase('Organizers', {
        orderByChild: 'projectKey',
        equalTo: projectKey,
      })
    )

  const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)

  const queue$ = createOrganizerInvite.queue$

  const viewState = {
    project$: sources.project$,
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
    organizers$: organizers$.map(rows),
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, queue$}
}
