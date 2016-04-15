import {Observable} from 'rx'
const {just, merge} = Observable

import isolate from '@cycle/isolate'

import {
  List,
  ListItemNavigating,
} from 'components/sdm'

import {TeamItemNavigating} from 'components/team'
import {OppItemNavigating} from 'components/opp'

import {QuickNav} from 'components/QuickNav'

const TEAMREGEX = /(team)\/(.+)\//
const OPPREGEX = /(opp)\/(.+)\//

const _TeamNav = sources => TeamItemNavigating({...sources,
  path$: sources.item$.combineLatest(
    sources.router.observable.pluck('pathname'),
    ({$key},path) => path.match(TEAMREGEX) ?
      path.replace(TEAMREGEX, `team/${$key}/`) :
      `/team/${$key}`
  ),
})

const _OppNav = sources => OppItemNavigating({...sources,
  path$: sources.item$.combineLatest(
    sources.router.observable.pluck('pathname'),
    ({$key},path) => path.match(OPPREGEX) ?
      path.replace(OPPREGEX, `opp/${$key}/`) :
      `/opp/${$key}`
  ),
})

const ProjectQuickNavMenu = sources => {
  const project = isolate(ListItemNavigating,'project')({...sources,
    title$: sources.project$.pluck('name'),
    path$: sources.projectKey$.map($key => '/project/' + $key),
  })

  const teams = isolate(List,'teams')({...sources,
    Control$: just(_TeamNav),
    rows$: sources.teams$,
  })

  const opps = isolate(List,'opps')({...sources,
    Control$: just(_OppNav),
    rows$: sources.opps$,
  })

  const nav = QuickNav({...sources,
    label$: sources.project$.pluck('name'),
    menuItems$: just([project.DOM, opps.DOM, teams.DOM]),
  })

  return {
    DOM: nav.DOM,
    route$: merge(opps.route$, project.route$, teams.route$),
  }
}

export {ProjectQuickNavMenu}
