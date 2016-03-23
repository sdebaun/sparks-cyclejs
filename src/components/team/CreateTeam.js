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
      title: 'Build your first Team',
      className: 'open',
      clickable: true,
    }),
    modal({
      isOpen,
      title: 'Build your first Team',
      iconName: 'group_add',
      submitLabel: 'Make It So',
      closeLabel: 'Hang On',
      content: teamFormDOM,
    })
  )

const CreateTeam = sources => {
  const teamForm = TeamForm(sources)

  const submit$ = _submitAction$(sources)

  const queue$ = teamForm.team$
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

export {CreateTeam}
