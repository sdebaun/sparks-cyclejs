import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import {col} from 'helpers'
import modal from 'helpers/modal'
import listItem from 'helpers/listItem'

// Bunch Of Sources and Sinks (BOSS) approach to components
// or Bunch of Stinkin' Streams if you prefer
// discuss here: https://github.com/sdebaun/sparks-cyclejs/issues/38

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.open').events('click').map(true),
  DOM.select('.close').events('click').map(false),
)

const _render = ({project, isOpen}) =>
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
      content: 'Invite another organizer to help you with ' + project.name + '.',
    })
  )

export default sources => {
  const isOpen$ = _openActions$(sources)
    .startWith(false)

  const viewState = {
    isOpen$,
    project$: sources.project$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM}
}
