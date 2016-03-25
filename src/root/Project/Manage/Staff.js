import {Observable} from 'rx'
const {just, merge} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'

import listItem from 'helpers/listItem'
import listHeader from 'helpers/listHeader'

import {col} from 'helpers'

// import {log} from 'util'

import {OrganizerInviteItem} from 'components/organizer'
import {List} from 'components/sdm'

const OrganizerInviteList = sources => List({...sources,
  Control$: just(OrganizerInviteItem),
})

const _renderOrganizerInvite = ({inviteEmail, authority}) =>
  listItem({
    iconName: 'mail_outline',
    title: inviteEmail,
    subtitle: authority,
  })

const _render = ({organizers, createOrganizerInviteDOM, listDOM}) =>
  col(
    createOrganizerInviteDOM,
    organizers.length > 0 ? listHeader({title: 'Open Invites'}) : null,
    // ...organizers.map(o => _renderOrganizerInvite(o)),
    listDOM,
  )

import {rows} from 'util'

export default sources => {
  const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)

  const list = OrganizerInviteList({...sources,
    rows$: sources.organizers$,
  })

  const queue$ = merge(
    createOrganizerInvite.queue$,
    list.queue$,
  )

  const viewState = {
    project$: sources.project$,
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
    organizers$: sources.organizers$.map(rows),
    listDOM$: list.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    queue$,
    route$: list.route$,
  }
}
