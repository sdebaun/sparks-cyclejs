// literally one line differene wit CreateTeam

import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

// import isolate from '@cycle/isolate'

import {Teams} from 'remote'

import {TeamForm} from './TeamForm'

import {col} from 'helpers'
import modal from 'helpers/modal'
import listItem from 'helpers/listItem'

// import {log} from 'util'

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.open').events('click').map(true),
  DOM.select('.close').events('click').map(false),
)

const _submitAction$ = ({DOM}) =>
  DOM.select('.submit').events('click').map(true)

const _render = ({isOpen, teamFormDOM}) =>
  col(
    listItem({
      iconName: 'group_add',
      iconBackgroundColor: 'yellow',
      title: 'Teams',
      className: 'open',
      clickable: true,
      header: true, // this is the line
    }),
    modal({
      isOpen,
      title: 'Add a Team',
      iconName: 'group_add',
      submitLabel: 'Make It So',
      closeLabel: 'Hang On',
      content: teamFormDOM,
    })
  )

const CreateTeamHeader = sources => {
  const teamForm = TeamForm(sources)

  const submit$ = _submitAction$(sources)

  const queue$ = teamForm.item$
    .sample(submit$)
    .zip(sources.projectKey$,
      (team,projectKey) => ({projectKey, ...team})
    )
    .map(Teams.create)

  const isOpen$ = _openActions$(sources)
    .merge(submit$.map(false))
    .startWith(false)

  const viewState = {
    isOpen$,
    project$: sources.project$,
    teamFormDOM$: teamForm.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, queue$}
}

export {CreateTeamHeader}
