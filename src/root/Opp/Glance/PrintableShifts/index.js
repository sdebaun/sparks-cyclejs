/* eslint-disable max-nested-callbacks */
import './styles.scss'
import {Observable as $} from 'rx'
import isolate from '@cycle/isolate'
import {div} from 'cycle-snabbdom'
import {map, prop} from 'ramda'

import {Shifts, Teams, Assignments, Memberships} from 'components/remote'
import {TabbedPage} from 'components/ui'
import Shift from './Shift'

function fetchAdditionSources(sources) {
  const teams$ = sources.projectKey$
    .flatMapLatest(Teams.query.byProject(sources))
    .shareReplay(1)

  const getKey = map(prop('$key'))

  const shiftsByTeam = Shifts.query.byTeam(sources)
  const shiftsByTeam$ = teams$.map(getKey)
    .map(map(shiftsByTeam))
    .flatMapLatest($.combineLatest)
    .shareReplay(1)

  const assignmentsByTeam = Assignments.query.byTeam(sources)
  const assignmentsByTeam$ = teams$.map(getKey)
    .map(map(assignmentsByTeam))
    .flatMapLatest($.combineLatest)
    .shareReplay(1)

  const membershipsByTeam = Memberships.query.byTeam(sources)
  const membershipsByTeam$ = teams$.map(getKey)
    .map(map(membershipsByTeam))
    .flatMapLatest($.combineLatest)
    .shareReplay(1)

  const teamsInfo$ = $.zip(
    teams$, shiftsByTeam$, assignmentsByTeam$, membershipsByTeam$,
    (teams, shifts, assignments, memberships) =>
      teams.map((team, i) => ({
        team,
        shifts: shifts[i],
        assignments: assignments[i],
        memberships: memberships[i],
      }))
  )

  return {
    ...sources,
    teams$,
    shiftsByTeam$,
    assignmentsByTeam$,
    membershipsByTeam$,
    teamsInfo$,
  }
}

function createRoutesFromTeamsInfo(sources) {
  return function createRoutes(teamsInfo) {
    const shiftNames = teamsInfo.map(s => s.team.name.replace(' ', '-'))
    const routes = {'/': () => ({
      DOM: $.of(div('Please select a shift you would like to print')),
    })}
    for (let i = 0; i < shiftNames.length; ++i) {
      routes['/' + shiftNames[i]] = () => Shift({...sources, // eslint-disable-line max-len, no-loop-func
        teamInfo$: $.of({
          team: teamsInfo[i].team,
          shifts: teamsInfo[i].shifts,
          assignments: teamsInfo[i].assignments,
          memberships: teamsInfo[i].memberships,
        }),
      })
    }
    return routes
  }
}

function createTabsFromRoutes(routes) {
  return Object.keys(routes).map(route =>
    route === '/' ? {path: route, label: 'Home'} :
    {path: route, label: route.replace('/', '').replace('-', ' ')}
  )
}

function PrintableShifts(sources) {
  const routes$ = sources.teamsInfo$
    .map(createRoutesFromTeamsInfo(sources))
    .filter(Boolean)
    .shareReplay(1)

  const tabs$ = routes$.map(createTabsFromRoutes)

  const tabbedPage = TabbedPage({...sources, tabs$, routes$})

  const view$ = $.combineLatest(tabbedPage.DOM, tabbedPage.tabBarDOM,
    (page, tabbar) => div([tabbar, page])
  )

  return {...tabbedPage, DOM: view$}
}

export default sources =>
  isolate(PrintableShifts, 'printableshifts')(fetchAdditionSources(sources))
