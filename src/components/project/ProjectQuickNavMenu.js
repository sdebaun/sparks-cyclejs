import {Observable} from 'rx'
const {just, merge} = Observable

import isolate from '@cycle/isolate'

import {
  List,
  ListItemNavigating,
} from 'components/sdm'

import {QuickNav} from 'components/QuickNav'

const OppItem = sources => ListItemNavigating({...sources,
  title$: sources.item$.pluck('name'),
  path$: sources.item$.map(({$key}) => '/opp/' + $key),
})

const TeamItem = sources => ListItemNavigating({...sources,
  title$: sources.item$.pluck('name'),
  path$: sources.item$.map(({$key}) => '/team/' + $key),
})

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
    label$: sources.project$.pluck('name'),
    menuItems$: just([project.DOM, teams.DOM, opps.DOM]),
  })

  return {
    DOM: nav.DOM,
    route$: merge(opps.route$, project.route$, teams.route$),
  }
}

export {ProjectQuickNavMenu}
