import {Observable} from 'rx'
const {just, merge} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import isolate from '@cycle/isolate'

import listItem from 'helpers/listItem'

import {h, div} from 'cycle-snabbdom'

import {rows} from 'util'
// import {log} from 'util'

import {
  List,
  ListItemNavigating,
} from 'components/sdm'

import {
  TeamItemNavigating,
  CreateTeamHeader,
} from 'components/team'

import {CreateOppHeader} from 'components/opp'

const _render = ({
  isMobile,
  teams,
  opps,
  teamsDOM,
  oppsDOM,
  titleDOM,
  teamListHeaderDOM,
  oppListHeaderDOM,
  createHref,
}) => {
  const teamRows = rows(teams)
  const oppRows = rows(opps)
  return div(
    {},
    [
      isMobile ? null : titleDOM,
      h('div.rowwrap', {style: {padding: '0px 15px'}}, [
        listItem({
          title: 'At a Glance',
          iconName: 'home',
          link: createHref('/'),
          className: 'navAction',
        }),
        listItem({
          title: 'Manage',
          iconName: 'settings',
          link: createHref('/manage'),
          className: 'navAction',
        }),
        teamRows.length > 0 ? teamListHeaderDOM : null,
        teamsDOM,
        oppRows.length > 0 ? oppListHeaderDOM : null,
        oppsDOM,
      ]),
    ]
  )
}

const OppItem = sources => ListItemNavigating({...sources,
  title$: sources.item$.pluck('name'),
  path$: sources.item$.map(({$key}) => '/opp/' + $key),
})

const ProjectNav = sources => {
  const teamListHeader = isolate(CreateTeamHeader)(sources)
  const oppListHeader = isolate(CreateOppHeader)(sources)

  const teams = List({...sources,
    Control$: just(TeamItemNavigating),
    rows$: sources.teams$,
  })

  const opps = List({...sources,
    Control$: just(OppItem),
    rows$: sources.opps$,
  })

  const route$ = merge(teams.route$, opps.route$)

  const queue$ = Observable.merge(
    teamListHeader.queue$,
    oppListHeader.queue$,
  )

  const viewState$ = {
    isMobile$: sources.isMobile$,
    teamListHeaderDOM$: teamListHeader.DOM,
    oppListHeaderDOM$: oppListHeader.DOM,
    teams$: sources.teams$,
    teamsDOM$: teams.DOM,
    opps$: sources.opps$,
    oppsDOM$: opps.DOM,
    titleDOM$: sources.titleDOM,
    createHref$: Observable.just(sources.router.createHref),
  }

  const DOM = combineLatestObj(viewState$).map(_render)

  return {
    DOM,
    route$,
    queue$,
  }
}

export {ProjectNav}
