import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import OrganizerInviteForm from 'components/OrganizerInviteForm'

import {col} from 'helpers'
import modal from 'helpers/modal'
import listItem from 'helpers/listItem'

import {log} from 'util'

// Bunch Of Sources and Sinks (BOSS) approach to components
// or Bunch of Stinkin' Streams if you prefer
// discuss here: https://github.com/sdebaun/sparks-cyclejs/issues/38

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.open').events('click').map(true),
  DOM.select('.close').events('click').map(false),
)

const _submitAction$ = ({DOM}) =>
  DOM.select('.submit').events('click').map(true)

const _render = ({project, isOpen, organizerInviteFormDOM}) =>
  col(
    listItem({
      iconName: 'person_add',
      title: 'Invite Organizer',
      className: 'open',
    }),
    modal({
      isOpen,
      title: 'Invite Organizer',
      iconName: 'person_add',
      submitLabel: 'Hell Yeah',
      closeLabel: 'No Way',
      content: organizerInviteFormDOM,
    })
  )

export default sources => {
  const organizerInviteForm = OrganizerInviteForm(sources)

  const isOpen$ = _openActions$(sources)
    .startWith(false)

  const organizer$ = organizerInviteForm.organizer$

  organizer$.subscribe(log('organizer$'))

  const viewState = {
    isOpen$,
    project$: sources.project$,
    organizerInviteFormDOM$: organizerInviteForm.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, organizer$}
}
