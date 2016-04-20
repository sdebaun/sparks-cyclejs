import {Observable as $} from 'rx'
// const {just, merge, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'cycle-snabbdom'
// import {log} from 'util'

import {combineDOMsToDiv} from 'util'

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
  NavigatingComplexCard,
} from 'components/sdm'

const CreateProjectListItem = sources => {
  const createBtn = RaisedButton({...sources,
    label$: $.just('Start a Project Anyway'),
  })

  const cancelBtn = FlatButton({...sources,
    label$: $.just('Nevermind'),
  })

  const form = ProjectForm(sources)

  const dialog = Dialog({...sources,
    titleDOM$: $.just('Create Project'),
    iconName$: $.just('sitemap'),
    contentDOM$: form.DOM,
    isOpen$: createBtn.click$.map(true),
  })

  const contentDOM$ = $.combineLatest(
    dialog.DOM,
    createBtn.DOM,
    cancelBtn.DOM,
    (dialogDOM, ...buttonsDOM) =>
      div({},[
        div({},[`
          Before our public launch, we are inviting Early Access Partners
          to try out the Sparks.Network.  You are welcome to create a project,
          but you'll only be able to start recruiting volunteers if you're
          an Early Access Partner.
        `]),
        div({}, buttonsDOM),
        dialogDOM,
      ])
  )

  const li = ListItemCollapsible({...sources,
    title$: $.just('Start your own project'),
    iconName$: $.just('sitemap'),
    contentDOM$,
    isOpen$: cancelBtn.click$.map(false),
  })

  return {
    DOM: li.DOM,
    project$: form.project$,
  }
}

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

// const _Fetch = sources => {
//   const projects$ = sources.userProfileKey$
//     .flatMapLatest(Projects.query.byOwner(sources))

//   const engagements$ = sources.userProfileKey$
//     .flatMapLatest(Engagements.query.byUser(sources))
//     .shareReplay(1)

//   const acceptedEngagements$ = engagements$
//     .map(engagements => engagements.filter(e => !!e.isAccepted))

//   const organizers$ = sources.userProfileKey$
//     .flatMapLatest(Organizers.query.byUser(sources))

//   return {
//     projects$,
//     engagements$,
//     organizers$,
//     acceptedEngagements$,
//   }
// }

const hideable = Control => sources => {
  const ctrl = Control(sources)
  const {DOM, ...sinks} = ctrl
  return {
    DOM: sources.isVisible$.flatMapLatest(v => v ? DOM : $.just(null)),
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

const ConfirmNowCard = sources => hideable(TitledCard)({...sources,
  elevation$: $.just(2),
  isVisible$: sources.engagement$.map(e => e.isAccepted && !e.isConfirmed),
  content$: $.just([`
    list item
  `]),
  title$: $.just('Confirm Now!'),
})

import NextSteps from './OldApplication/NextSteps'

const NSCard = sources => {
  const ns = NextSteps(sources)
  return {
    ...TitledCard({...sources,
      content$: $.just([ns.DOM]),
    }),
    route$: ns.route$,
  }
}

const ApplicationOpenCard = sources => hideable(NSCard)({...sources,
  elevation$: $.just(2),
  isVisible$: sources.engagement$.map(e => e.isApplied && !e.isAccepted),
  title$: $.just('Awaiting Approval'),
})

const CombinedList = sources => ({
  DOM: sources.contents$.map(contents => div('.cardcontainer',contents)),
})

const CardList = sources => {
  const confirm = ConfirmNowCard(sources)
  const app = ApplicationOpenCard(sources)
  // const conf = ConfirmationsNeededCard(sources)
  // const managed = ManagedList(sources)
  // const engaged = EngagedList(sources)

  const contents$ = $.combineLatest(
    confirm.DOM,
    app.DOM,
    // conf.DOM,
    // managed.contents$,
    // engaged.contents$,
    (c, a) => [c, a]
    // (w, c, m, e) => [w, c, ...m, ...e]
  )

  return {
    ...CombinedList({...sources,
      contents$,
    }),
    route$: $.merge(confirm.route$, app.route$),
    // route$: $.merge(managed.route$, engaged.route$, conf.route$),
  }
}

// const CardList = sources => ({DOM: $.just(div('',[]))})

export default sources => {
  // const _sources = {...sources, ..._Fetch(sources)}
  const cards = CardList(sources)

  return {
    DOM: cards.DOM,
    route$: cards.route$,
  }
}
