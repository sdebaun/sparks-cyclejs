import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import quickNavMenu from 'helpers/quickNavMenu'

import {rows, log} from 'util'

// these are action creators specific to cyclic-fire and should live there
import {PROVIDERS} from 'util'

const _navActions$ = ({DOM, projectKey$}) =>
  Observable.merge(
    projectKey$.sample(DOM.select('.project').events('click'))
      .map(projectKey => '/project/' + projectKey)
  )

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.project-menu-button').events('click').map(true),
  DOM.select('.close-menu').events('click').map(false),
)

const _menuItems = (project, teams) => [
  {className: 'project', label: project.name},
  ...rows(teams).map(team => ({classame: 'team', label: team.name})),
].filter(r => !!r)

const _render = ({auth, userProfile, isOpen, project, teams}) =>
  quickNavMenu({
    isOpen,
    className: 'project-menu-button', // necessary with isolate?
    label: project.name,
    menu: {rightAlign: true},
    items: _menuItems(project,teams),
  })

export default sources => {
  const route$ = _navActions$(sources)

  const isOpen$ = _openActions$(sources)
    .merge(route$.map(false))
    .startWith(false)

  const viewState = {
    isOpen$,
    project$: sources.project$,
    teams$: sources.teams$,
    auth$: sources.auth$,
    userProfile$: sources.userProfile$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, route$}
}
