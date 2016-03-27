// TODO: TLC

import {Observable} from 'rx'
const {just, merge, empty, combineLatest} = Observable

import combineLatestObj from 'rx-combine-latest-obj'

import quickNavMenu from 'helpers/quickNavMenu'
import isolate from '@cycle/isolate'

import {div} from 'helpers'
import {rows} from 'util'
import {log} from 'util'

import {
  List,
  ListItemNavigating,
  Menu,
} from 'components/sdm'

import {QuickNav} from 'components/QuickNav'

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

// const _teamItems = teamRows => [
//   teamRows.length && {divider: true},
//   ...teamRows.map(({name,$key}) => (
//     {className: 'team', label: name, key: $key}
//   )),
// ]

// const _oppItems = oppRows => [
//   oppRows.length && {divider: true},
//   ...oppRows.map(({name,$key}) => (
//     {className: 'opp', label: name, key: $key}
//   )),
// ]

// const _menuItems = (project, teams, opps) => [
//   {className: 'project', label: project.name},
//   ..._teamItems(rows(teams)),
//   ..._oppItems(rows(opps)),
// ].filter(r => !!r)

const OppItem = sources => ListItemNavigating({...sources,
  title$: sources.item$.pluck('name'),
  path$: sources.item$.map(({$key}) => '/opp/' + $key),
})

const TeamItem = sources => ListItemNavigating({...sources,
  title$: sources.item$.pluck('name'),
  path$: sources.item$.map(({$key}) => '/team/' + $key),
})

// const _render = ({isOpen, project, teams, opps}) =>
//   quickNavMenu({
//     isOpen,
//     className: 'project-menu-button', // necessary with isolate?
//     label: project.name,
//     menu: {rightAlign: false},
//     items: _menuItems(project,teams,opps),
//   })

// const HeaderClickable = sources => ({
//   click$: sources.DOM.select('.nav').events('click'),
//   DOM: sources.label$.map(l => div('.nav',[l])),
// })

// const QuickNav = sources => {
//   const item = HeaderClickable(sources)

//   const isOpen$ = item.click$.map(true).startWith(false)

//   const children$ = sources.menuItems$ || just([])

//   const menu = Menu({
//     ...sources,
//     isOpen$,
//     children$,
//   })

//   const viewState = {
//     itemDOM$: item.DOM,
//     menuDOM$: menu.DOM,
//   }

//   const DOM = combineLatestObj(viewState)
//     .map(({itemDOM, menuDOM}) =>
//       div({},[itemDOM, menuDOM])
//     )

//   return {
//     DOM,
//   }
// }

const ProjectQuickNavMenu = sources => {
  const project = isolate(ListItemNavigating,'project')({...sources,
    title$: sources.project$.pluck('name'),
    path$: sources.projectKey$.map($key => '/project/' + $key),
  })

  const teams = List({...sources,
    Control$: just(TeamItem),
    rows$: sources.teams$,
  })

  const opps = List({...sources,
    Control$: just(OppItem),
    rows$: sources.opps$,
  })

  const nav = isolate(QuickNav,'quicknav')({...sources,
    label$: just('quicknav'),
    menuItems$: just([project.DOM, teams.DOM, opps.DOM]),
  })

  return {
    DOM: nav.DOM,
    route$: merge(opps.route$, project.route$, teams.route$),
  }
}

// const ListItemClickable = sources => ({
//   click$: sources.DOM.select('.list-item').events('click'),

//   DOM: ListItem({...sources,
//     classes$: just({clickable: true}),
//   }).DOM,
// })

// const ListItemNavigating = sources => {
//   const item = ListItemClickable(sources)

//   const route$ = item.click$
//     .flatMapLatest(sources.path$ || just('/'))

//   return {
//     DOM: item.DOM,
//     route$,
//   }
// }

const xxProjectQuickNavMenu = sources => {
  const teams = List({...sources,
    Control$: just(TeamItem),
    rows$: sources.teams$,
  })

  const opps = List({...sources,
    Control$: just(OppItem),
    rows$: sources.opps$,
  })

  const lists = [teams, opps]

  return {
    DOM: combineLatest(
      ...lists.map(l => l.DOM),
      (...doms) => div({},doms)
    ),
    route$: merge(...lists.map(l => l.route$)),
  }
}

// const xProjectQuickNavMenu = sources => {
//   const route$ = _navActions$(sources)

//   const isOpen$ = _openActions$(sources)
//     .merge(route$.map(false))
//     .startWith(false)

//   const viewState = {
//     isOpen$,
//     project$: sources.project$,
//     teams$: sources.teams$,
//     opps$: sources.opps$,
//     auth$: sources.auth$,
//     userProfile$: sources.userProfile$,
//   }

//   const DOM = combineLatestObj(viewState).map(_render)

//   return {DOM, route$}
// }

export {ProjectQuickNavMenu}
