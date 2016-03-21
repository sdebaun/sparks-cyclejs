import {Observable} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'

import quickNavMenu from 'helpers/quickNavMenu'

import {rows} from 'util'
// import {log} from 'util'

// const _navActions$ = ({DOM, projectKey$}) =>
//   Observable.merge(
//     projectKey$.sample(DOM.select('.project').events('click'))
//       .map(projectKey => '/apply/' + projectKey),
//     DOM.select('.opp').events('click')
//       .map(e => e.ownerTarget.dataset.link)
//   )

const _openActions$ = ({DOM}) => Observable.merge(
  DOM.select('.apply-menu-button').events('click').map(true),
  DOM.select('.close-menu').events('click').map(false),
)

const _oppItems = (oppRows, createHref) => [
  // oppRows.length && {divider: true},
  ...oppRows.map(({name,$key}) => (
    {className: 'opp.navLink', label: name, link: createHref('/opp/' + $key)},
  )),
]

const _menuItems = (project, opps, createHref) => [
  ..._oppItems(rows(opps), createHref),
].filter(r => !!r)

const _render = ({isOpen, project, opps, createHref}) =>
  quickNavMenu({
    isOpen,
    className: 'apply-menu-button', // necessary with isolate?
    label: 'Check out one of these ways you can get involved...',
    menu: {rightAlign: false},
    items: _menuItems(project,opps,createHref),
    color: '#000',
  })

const _navActions = ({DOM}) =>
  DOM.select('.navLink').events('click')
    .map(e => e.ownerTarget.dataset.link)

export default sources => {
  const route$ = _navActions(sources)

  const isOpen$ = _openActions$(sources)
    .merge(route$.map(false))
    .startWith(false)

  const viewState = {
    isOpen$,
    project$: sources.project$,
    opps$: sources.opps$,
    auth$: sources.auth$,
    userProfile$: sources.userProfile$,
    createHref: Observable.just(sources.router.createHref),
  }

  const DOM = combineLatestObj(viewState).map(_render)

  return {
    DOM,
    route$,
  }
}
