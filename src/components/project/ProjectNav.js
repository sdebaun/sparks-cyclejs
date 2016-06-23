import {Observable} from 'rx'
const {just, merge, combineLatest} = Observable
import {objOf} from 'ramda'

import isolate from '@cycle/isolate'

import {div, icon} from 'helpers'

import {Opps, Teams} from 'components/remote'

// import {log} from 'util'

import {
  ListItemNavigating,
  ListItemWithDialog,
  ListWithHeader,
} from 'components/sdm'

import {
  TeamForm,
  TeamItemNavigating,
} from 'components/team'

import {
  OppForm,
  OppItemNavigating,
} from 'components/opp'

const Glance = sources => ListItemNavigating({...sources,
  title$: just('At a Glance'),
  iconName$: just('home'),
  path$: just(sources.router.createHref('/')),
})

const Manage = sources => ListItemNavigating({...sources,
  title$: just('Manage'),
  iconName$: just('settings'),
  path$: just(sources.router.createHref('/manage')),
})

const CreateTeamHeader = sources => {
  const form = TeamForm(sources)

  const item = ListItemWithDialog({...sources,
    title$: just('teams'),
    dialogTitleDOM$: just('Create Team'),
    dialogContentDOM$: form.DOM,
    rightDOM$: just(icon('plus')),
    dialogIconName$: just('group'),
    classes$: just({header: true}),
  })

  const queue$ = form.item$
    .sample(item.submit$)
    .zip(sources.projectKey$,
      (team,projectKey) => ({values: {...team, projectKey}})
    )
    .map(Teams.action.create)

  return {
    DOM: item.DOM,
    queue$,
  }
}

const TeamListNavigatingAndAdding = sources => {
  const header = isolate(CreateTeamHeader,'create-team')(sources)

  const list = ListWithHeader({...sources,
    headerDOM: header.DOM,
    Control$: just(TeamItemNavigating),
  })

  return {
    DOM: list.DOM,
    route$: list.route$,
    queue$: header.queue$,
  }
}

const CreateOppHeader = sources => {
  const form = OppForm(sources)

  const item = ListItemWithDialog({...sources,
    title$: just('opportunities'),
    dialogTitleDOM$: just('Create Opportunity'),
    dialogContentDOM$: form.DOM,
    rightDOM$: just(icon('plus')),
    dialogIconName$: just('power'),
    classes$: just({header: true}),
  })

  const queue$ = form.item$
    .sample(item.submit$)
    .zip(sources.projectKey$,
      (opp,projectKey) => ({projectKey, ...opp})
    )
    .map(objOf('values'))
    .map(Opps.action.create)

  return {
    DOM: item.DOM,
    queue$,
  }
}

const OppListNavigatingAndAdding = sources => {
  const header = isolate(CreateOppHeader,'create-opp')(sources)

  const list = ListWithHeader({...sources,
    headerDOM: header.DOM,
    Control$: just(OppItemNavigating),
  })

  return {
    DOM: list.DOM,
    route$: list.route$,
    queue$: header.queue$,
  }
}

const ProjectNav = sources => {
  const glance = isolate(Glance,'glance')(sources)
  const manage = isolate(Manage,'manage')(sources)

  const teams = TeamListNavigatingAndAdding({...sources,
    rows$: sources.teams$,
  })

  const opps = OppListNavigatingAndAdding({...sources,
    rows$: sources.opps$,
  })

  const childs = [glance, manage, opps, teams]

  const route$ = merge(...childs.map(c => c.route$))

  const queue$ = merge(opps.queue$, teams.queue$)

  const DOM = combineLatest(
    sources.titleDOM,
    ...childs.map(c => c.DOM),
    (...doms) => div({},doms)
  )
  return {
    DOM,
    route$,
    queue$,
  }
}

export {ProjectNav}
