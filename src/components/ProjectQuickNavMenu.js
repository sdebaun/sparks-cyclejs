import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import quickNavMenu from 'helpers/quickNavMenu'

import {rows} from 'util'
// import {log} from 'util'

const _navActions$ = ({DOM, projectKey$}) =>
  Observable.merge(
    projectKey$.sample(DOM.select('.project').events('click'))
      .map(projectKey => '/project/' + projectKey),
    DOM.select('.team').events('click')
      .map(e => '/team/' + e.ownerTarget.dataset.key),
    DOM.select('.opp').events('click')
      .map(e => '/opp/' + e.ownerTarget.dataset.key)
  )

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.project-menu-button').events('click').map(true),
  DOM.select('.close-menu').events('click').map(false),
)

const _teamItems = teamRows => [
  teamRows.length && {divider: true},
  ...teamRows.map(({name,$key}) => (
    {className: 'team', label: name, key: $key}
  )),
]

const _oppItems = oppRows => [
  oppRows.length && {divider: true},
  ...oppRows.map(({name,$key}) => (
    {className: 'opp', label: name, key: $key}
  )),
]

const _menuItems = (project, teams, opps) => [
  {className: 'project', label: project.name},
  ..._teamItems(rows(teams)),
  ..._oppItems(rows(opps)),
].filter(r => !!r)

const _render = ({isOpen, project, teams, opps}) =>
  quickNavMenu({
    isOpen,
    className: 'project-menu-button', // necessary with isolate?
    label: project.name,
    menu: {rightAlign: false},
    items: _menuItems(project,teams,opps),
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
    opps$: sources.opps$,
    auth$: sources.auth$,
    userProfile$: sources.userProfile$,
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {DOM, route$}
}
