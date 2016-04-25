import {Observable as $} from 'rx'
// const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'
// import {log} from 'util'

import {combineDOMsToDiv, hideable} from 'util'

import {
  Projects,
  Engagements,
  Organizers,
  Opps,
  ProjectImages,
} from 'components/remote'

import {ProjectItem, ProjectForm, ProjectAvatar} from 'components/project'
import {EngagementItem} from 'components/engagement'

import {
  List,
  PartialList,
  ListWithHeader,
  ListItem,
  ListItemNavigating,
  ListItemCollapsible,
  RaisedButton,
  FlatButton,
  Dialog,
  TitledCard,
  ComplexCard,
  Card,
  NavigatingComplexCard,
} from 'components/sdm'

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

// const hideable = Control => sources => {
//   const ctrl = Control(sources)
//   const {DOM, ...sinks} = ctrl
//   return {
//     DOM: sources.isVisible$.flatMapLatest(v => v ? DOM : $.just(null)),
//     ...sinks,
//   }
// }

const _EngagementFetcher = sources => {
  const opp$ = sources.item$.pluck('oppKey')
    .flatMapLatest(Opps.query.one(sources))
  const projectKey$ = opp$.pluck('projectKey')
  const project$ = projectKey$
    .flatMapLatest(Projects.query.one(sources))
  const projectImage$ = projectKey$
    .flatMapLatest(ProjectImages.query.one(sources))

  return {
    opp$,
    projectKey$,
    project$,
    projectImage$,
  }
}

const EngagedCard = sources => {
  const _sources = {...sources, ..._EngagementFetcher(sources)}

  return NavigatingComplexCard({..._sources,
    src$: _sources.projectImage$.map(p => p && p.dataUrl || null),
    title$: _sources.project$.pluck('name'),
    // subtitle$: opp$.pluck('name'),
    subtitle$: $.combineLatest(
      _sources.opp$.pluck('name'),
      _sources.item$,
      (name, item) => `${name} | ${_label(item)}`
    ),
    path$: _sources.item$.map(({$key}) => `/engaged/${$key}`),
  })
}

const EngagedList = sources => PartialList({...sources,
  rows$: sources.engagements$,
  Control$: $.just(EngagedCard),
})

const ManagedCard = sources => NavigatingComplexCard({...sources,
  title$: sources.item$.pluck('name'),
  subtitle$: $.just('Owner'),
  path$: sources.item$.map(({$key}) => `/project/${$key}`),
})

const ManagedList = sources => PartialList({...sources,
  rows$: sources.projects$,
  Control$: $.just(ManagedCard),
})

const ConfirmListItem = sources => {
  const _sources = {...sources, ..._EngagementFetcher(sources)}
  return ListItemNavigating({..._sources,
    leftDOM$: ProjectAvatar(_sources).DOM,
    title$: _sources.project$.pluck('name'),
    subtitle$: _sources.opp$.map(({name}) => `${name} | Accepted`),
    path$: _sources.item$.map(({$key}) => `/engaged/${$key}/schedule`),
  })
}

const ConfirmationsList = sources => PartialList({...sources,
  rows$: sources.acceptedEngagements$,
  Control$: $.just(ConfirmListItem),
})

const ConfirmationsNeededCard = sources => {
  const list = ConfirmationsList(sources)
  const contents$ = list.contents$
    .map(contents => ['You\'ve been approved for these opportunities.  Confirm now to lock in your spot!', ...contents])
  const card = hideable(TitledCard)({...sources,
    elevation$: $.just(2),
    isVisible$: sources.acceptedEngagements$.map(c => c.length > 0),
    content$: contents$,
    title$: $.just('Confirm Your Spot!'),
  })
  return {
    ...card,
    route$: list.route$,
  }
}

// import NextSteps from './OldApplication/NextSteps'

import {
  ToDoListItem,
} from 'components/ui'

const ToDoShifts = sources => ToDoListItem({...sources,
  title$: $.of('Choose when you\'d like to work.'),
  isDone$: sources.engagement$.map(m => !!m.isAssigned),
  path$: $.of(sources.router.createHref('/confirmation')),
})

const ToDoPayment = sources => ToDoListItem({...sources,
  title$: $.of('Make your payments.'),
  isDone$: sources.engagement$.map(m => !!m.isPaid),
  path$: $.of(sources.router.createHref('/confirmation')),
})

const CNCard = sources => {
  const sh = ToDoShifts(sources)
  const pmt = ToDoPayment(sources)

  const card = TitledCard({...sources,
    title$: $.just('Lock in Your Spot'),
    content$: $.combineLatest(sh.DOM, pmt.DOM),
  })

  return {
    DOM: card.DOM,
    route$: $.merge(sh.route$, pmt.route$),
  }
}

const ConfirmNowCard = sources => hideable(CNCard)({...sources,
  elevation$: $.just(2),
  isVisible$: sources.engagement$.map(e => e.isAccepted && !e.isConfirmed && !e.isPaid),
  title$: $.just('Confirm Now!'),
})


import EnergyExchange from '../Glance/Commitments'

const EnergyExchangeCard = sources => {
  const ee = EnergyExchange(sources)
  return {
    ...Card({...sources,
      content$: $.just([ee.DOM]),
    }),
  }
}

const CombinedList = sources => ({
  DOM: sources.contents$.map(contents => div('.cardcontainer',contents)),
})

import {CardUpcomingShifts} from './CardUpcomingShifts'
import {CardApplicationNextSteps} from './CardApplicationNextSteps'

const CardList = sources => {
  const confirm = ConfirmNowCard(sources)
  const app = CardApplicationNextSteps(sources)
  const r2w = CardUpcomingShifts(sources)
  const ee = EnergyExchangeCard(sources)

  const contents$ = $.combineLatest(
    confirm.DOM,
    app.DOM,
    r2w.DOM,
    ee.DOM,
    (...doms) => doms
  )

  return {
    ...CombinedList({...sources,
      contents$,
    }),
    route$: $.merge(confirm.route$, app.route$),
  }
}

export default sources => {
  const cards = CardList(sources)

  return {
    DOM: cards.DOM,
    route$: cards.route$,
  }
}
