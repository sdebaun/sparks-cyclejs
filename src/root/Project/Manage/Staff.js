import {Observable as $} from 'rx'
const {just, merge} = $

import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'
import {prop, complement, filter} from 'ramda'

import CreateOrganizerInvite from 'components/CreateOrganizerInvite'

import listHeader from 'helpers/listHeader'

import {col} from 'helpers'

// import {log} from 'util'

import {
  OrganizerInviteItem,
  OrganizerAcceptedItem,
} from 'components/organizer'

import {List, ListItem} from 'components/sdm'

const EmptyItemDom = sources => just(
  ListItem({
    ...sources,
    title$: just(sources.title),
  }).DOM)

const OrganizerInviteList = sources => List({
  ...sources,
  Control$: just(OrganizerInviteItem),
  emptyDOM$: EmptyItemDom({...sources, title: 'No open invites'}),
})

const OrganizerAcceptedList = sources => List({
  ...sources,
  Control$: just(OrganizerAcceptedItem),
  emptyDOM$: EmptyItemDom({...sources, title: 'No accepted invites'}),
})

const _render = ({createOrganizerInviteDOM, openListDOM, acceptedListDOM}) =>
  col(
    createOrganizerInviteDOM,
    listHeader({title: 'Open Invites'}),
    openListDOM,
    listHeader({title: 'Accepted Invites'}),
    acceptedListDOM,
  )

const isAcceptedΩ = prop('isAccepted')
const notAcceptedΩ = complement(isAcceptedΩ)

export default sources => {
  const createOrganizerInvite = isolate(CreateOrganizerInvite)(sources)

  const openList = OrganizerInviteList({
    ...sources,
    rows$: sources.organizers$.map(filter(notAcceptedΩ)),
  })

  const acceptedList = OrganizerAcceptedList({
    ...sources,
    rows$: sources.organizers$.map(filter(isAcceptedΩ)),
  })

  const queue$ = merge(
    createOrganizerInvite.queue$,
    openList.queue$,
    acceptedList.queue$,
  )

  const viewState = {
    createOrganizerInviteDOM$: createOrganizerInvite.DOM,
    openListDOM$: openList.DOM,
    acceptedListDOM$: acceptedList.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    queue$,
    route$: openList.route$,
  }
}
