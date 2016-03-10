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
      title: 'A Dialog Yo',
      iconName: 'person_add',
      submitLabel: 'Hell Yeah',
      closeLabel: 'No Way',
      content: 'This is my content',
    })
  )

// main function for the component
// should only be a few lines, describing transformations
export default sources => {
  // everything past this only relates to the dom sink

  // complex behavior in streams for private view state
  // if it takes more than a line or two to express
  // extract it into another _function$({thing$, ...sources})
  const isOpen$ = _openActions$(sources)
    .startWith(false)

  // the dom is just a slightly more complicated transformation
  // but much of it is repeatable; through combineLatestObj hackery
  // snapshots of the state streams are mapped to _render
  const viewState = {
    isOpen$,
    project$: sources.project$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM}
}
