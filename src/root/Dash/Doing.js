import {Observable as $} from 'rx'
const {just, merge, combineLatest} = $
import {map, flatten} from 'ramda'

import {div} from 'cycle-snabbdom'
import {lr} from 'util'

import {
  Projects,
  Engagements,
  Organizers,
  Opps,
  ProjectImages,
} from 'components/remote'

import {ProjectAvatar} from 'components/project'

import {
  PartialList,
  ListItemNavigating,
  TitledCard,
  NavigatingComplexCard,
} from 'components/sdm'

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

const _Fetch = sources => {
  const engagements$ = sources.userProfileKey$
    .flatMapLatest(Engagements.query.byUser(sources))
    .shareReplay(1)

  const acceptedEngagements$ = engagements$
    .map(engagements => engagements.filter(e => !!e.isAccepted && !e.isPaid))

  const organizers$ = sources.userProfileKey$
    .flatMapLatest(Organizers.query.byUser(sources))
    .shareReplay(1)

  const ownedProjects$ = sources.userProfileKey$
    .flatMapLatest(Projects.query.byOwner(sources))

  const organizerProjects$ = lr(organizers$.tap(x => console.log('', x)),
      os => os.length > 0,
      t$ => t$.map(
        map(o => Projects.query.one(sources)(o.projectKey)
          .map(p => ({...p, $key: o.projectKey})) // eslint-disable-line
        )
      ).flatMapLatest(ps => $.combineLatest(...ps)),
      f$ => f$
    ).startWith([])

  const projects$ = $.combineLatest(
      ownedProjects$, organizerProjects$)
    .map(flatten)
    .shareReplay(1)

  return {
    projects$,
    engagements$,
    organizers$,
    acceptedEngagements$,
  }
}

const hideable = Control => sources => {
  const ctrl = Control(sources)
  const {DOM, ...sinks} = ctrl
  return {
    DOM: sources.isVisible$.flatMapLatest(v => v ? DOM : just(null)),
    ...sinks,
  }
}

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
    subtitle$: combineLatest(
      _sources.opp$.pluck('name'),
      _sources.item$,
      (name, item) => `${name} | ${_label(item)}`
    ),
    path$: _sources.item$.map(({$key}) => `/engaged/${$key}`),
  })
}

const EngagedList = sources => PartialList({...sources,
  rows$: sources.engagements$,
  Control$: just(EngagedCard),
})

const ManagedCard = sources => NavigatingComplexCard({...sources,
  title$: sources.item$.pluck('name'),
  subtitle$: just('Owner'),
  path$: sources.item$.map(({$key}) => `/project/${$key}`),
})

const ManagedList = sources => PartialList({...sources,
  rows$: sources.projects$,
  Control$: just(ManagedCard),
})

const WelcomeCard = sources => hideable(TitledCard)({...sources,
  elevation$: just(2),
  isVisible$: combineLatest(
    sources.projects$, sources.engagements$,
    (p,e) => p.length === 0 && e.length === 0
  ),
  content$: just([`
    During our Beta, there are only a limited number of opportunities,
    but anyone can apply to them.
  `]),
  title$: just('Welcome to the Sparks.Network!'),
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
  Control$: just(ConfirmListItem),
})

const approvedMsg =
  `You've been approved for these opportunities. ` +
  `Confirm now to lock in your spot!`

const ConfirmationsNeededCard = sources => {
  const list = ConfirmationsList(sources)
  const contents$ = list.contents$
    .map(contents => [approvedMsg, ...contents])
  const card = hideable(TitledCard)({...sources,
    elevation$: just(2),
    isVisible$: sources.acceptedEngagements$.map(c => c.length > 0),
    content$: contents$,
    title$: just('Confirm Your Spot!'),
  })
  return {
    ...card,
    route$: list.route$,
  }
}

const CombinedList = sources => ({
  DOM: sources.contents$
    .tap(x => console.log('contents$', x))
    .map(contents => div('',contents)),
})

const CardList = sources => {
  const welc = WelcomeCard(sources)
  const conf = ConfirmationsNeededCard(sources)
  const managed = ManagedList(sources)
  const engaged = EngagedList(sources)

  const contents$ = combineLatest(
    welc.DOM,
    conf.DOM,
    managed.contents$,
    engaged.contents$,
    (w, c, m, e) => [w, c, ...m, ...e]
  )

  return {
    ...CombinedList({...sources,
      contents$,
    }),
    route$: merge(managed.route$, engaged.route$, conf.route$),
  }
}

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}
  const cards = CardList(_sources)

  return {
    DOM: cards.DOM.map(d => div('.cardcontainer',[d])),
    route$: cards.route$,
  }
}
