import {Observable} from 'rx'
const {just, combineLatest} = Observable

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

import {ProjectItem, ProjectForm} from 'components/project'
import {EngagementItem} from 'components/engagement'

import {
  List,
  ListWithHeader,
  ListItem,
  ListItemCollapsible,
  RaisedButton,
  FlatButton,
  Dialog,
  TitledCard,
  ComplexCard,
  NavigatingComplexCard,
} from 'components/sdm'

// const ManagedProjectsHeader = () => ListItem({
//   classes$: just({header: true}),
//   title$: just('projects you manage'),
// })

// const xManagedItem = sources => ProjectItem({...sources,
//   subtitle$: just('owner'),
// })

// const xManagedList = sources => {
//   const header = ManagedProjectsHeader(sources)

//   const list = List({...sources,
//     Control$: just(ManagedCard),
//   })

//   const DOM = sources.rows$.combineLatest(
//     header.DOM,
//     list.DOM,
//     (rows, ...doms) =>
//       div({}, rows.length > 0 ? doms : []),
//   )

//   return {
//     DOM,
//     route$: list.route$,
//   }
// }

// const EngagedHeader = () => ListItem({
//   classes$: just({header: true}),
//   title$: just('projects you\'re involved with'),
// })

// const EngagedList = sources => {
//   const header = EngagedHeader(sources)

//   const list = List({...sources,
//     Control$: just(EngagementItem),
//   })

//   const DOM = sources.rows$.combineLatest(
//     header.DOM,
//     list.DOM,
//     (rows, ...doms) =>
//       div({}, rows.length > 0 ? doms : []),
//   )

//   return {
//     DOM,
//     route$: list.route$,
//   }
// }

// const OrganizingItem = sources => {
//   const projectKey$ = sources.item$.pluck('projectKey')

//   const project$ = projectKey$
//     .flatMapLatest(Projects.query.one(sources))
//     // bc ProjectItem expects its item$ to have a $key
//     .combineLatest(projectKey$, (_p,$key) => ({..._p, $key}))

//   return ProjectItem({...sources,
//     subtitle$: sources.item$.pluck('authority'),
//     item$: project$,
//     path$: projectKey$.map(k => '/project/' + k),
//   })
// }

// const OrganizingList = sources => {
//   const hdr = ListItem({...sources,
//     title$: just('Projects you\'re Organizing'),
//     classes$: just({header: true}),
//   })
//   return ListWithHeader({...sources,
//     headerDOM: hdr.DOM,
//     Control$: just(OrganizingItem),
//   })
// }

const CreateProjectListItem = sources => {
  const createBtn = RaisedButton({...sources,
    label$: just('Start a Project Anyway'),
  })

  const cancelBtn = FlatButton({...sources,
    label$: just('Nevermind'),
  })

  const form = ProjectForm(sources)

  const dialog = Dialog({...sources,
    titleDOM$: just('Create Project'),
    iconName$: just('sitemap'),
    contentDOM$: form.DOM,
    isOpen$: createBtn.click$.map(true),
  })

  const contentDOM$ = combineLatest(
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
    title$: just('Start your own project'),
    iconName$: just('sitemap'),
    contentDOM$,
    isOpen$: cancelBtn.click$.map(false),
  })

  return {
    DOM: li.DOM,
    project$: form.project$,
  }
}

// const Welcome = sources => ({...sources,
//   DOM: sources.isVisible$.map(show => show &&
//     div({},`
//     Welcome to the Sparks.Network!
//     During our Beta, there are only a limited number opportunities,
//     but anyone can apply.
//     `)
//   ),
// })

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

// const acceptedCardView = sources => item =>
//   div({}, [
//     p({style: {fontSize: '1em', fontWeight: 'bold'}},
//       'Congrats! You\'ve been accepted. Confirm to lock your spot for:'),
//     ListItem({...sources,
//       iconSrc$: just(item.opp.projectKey)
//         .flatMapLatest(ProjectImages.query.one(sources))
//         .map(i => i && i.dataUrl || '/' + sparkly),
//       title$: just(div({style: {margin: 0, padding: 0}}, [
//         p({style: {fontWeight: 'bold', margin: 0}}, [
//           item.opp.project.name,
//         ]),
//         p('.subtitle', {style: {margin: 0, fontSize: '0.8em'}}, [
//           `${item.opp.name} | ${_label(item)}`,
//         ]),
//       ])),
//     }).DOM,
//   ])

// const AcceptedCard = sources => Card({
//   ...sources,
//   elevation$: just(2),
//   header$: just('Confirm Now!'),
//   content$: sources.item$.map(acceptedCardView(sources)),
//   path$: sources.item$.map(i => `/engaged/${i.$key}/`),
// })

// const ConfirmationCards = sources =>
//   List({
//     ...sources,
//     rows$: sources.acceptedEngagements$,
//     Control$: just(AcceptedCard),
//   })

const _Fetch = sources => {
  const projects$ = sources.userProfileKey$
    .flatMapLatest(Projects.query.byOwner(sources))

  const engagements$ = sources.userProfileKey$
    .flatMapLatest(Engagements.query.byUser(sources))

  const acceptedEngagements$ = engagements$
    .map(engagements => engagements.filter(e => e.isAccepted))

  const organizers$ = sources.userProfileKey$
    .flatMapLatest(Organizers.query.byUser(sources))

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

const EngagedCard = sources => {
  const opp$ = sources.item$.pluck('oppKey')
    .flatMapLatest(Opps.query.one(sources))
  const project$ = opp$.pluck('projectKey')
    .flatMapLatest(Projects.query.one(sources))

  return ComplexCard({...sources,
    title$: project$.pluck('name'),
    subtitle$: opp$.pluck('name'),
  })
}

const EngagedList = sources => List({...sources,
  rows$: sources.engagements$,
  Control$: just(EngagedCard),
})

const ManagedCard = sources => NavigatingComplexCard({...sources,
  title$: sources.item$.pluck('name'),
  subtitle$: just('Owner'),
  path$: sources.item$.map(({$key}) => `/project/${$key}`),
})

const ManagedList = sources => List({...sources,
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

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const welc = WelcomeCard(_sources)
  // const conf = ConfirmationCards(_sources)

  // const create = isolate(CreateProjectListItem,'create')(_sources)

  const managed = ManagedList(_sources)
  const engaged = EngagedList(_sources)

  // const engaged = isolate(EngagedList,'engaged')({..._sources,
  //   rows$: _sources.engagements$,
  // })

  // const organizing = isolate(OrganizingList,'orgz')({..._sources,
  //   rows$: _sources.organizers$,
  // })

  // const queue$ = create.project$
    // .map(Projects.action.create)

  const route$ = Observable.merge(
    managed.route$,
    engaged.route$,
  //   organizing.route$,
  //   conf.route$,
  //   Projects.redirect.create(_sources).route$,
  ).tap(x => console.log('route$', x))

  const DOM = combineDOMsToDiv('',
    // create,
    // conf,
    welc,
    managed,
    // organizing,
    engaged,
  )

  // const DOM = combineLatest(
  //   create.DOM,
  //   conf.DOM,
  //   welc.DOM,
  //   managed.DOM,
  //   organizing.DOM,
  //   engaged.DOM,
  //   (isEAP, cr, confirm, ...doms) =>
  //     div({},[confirm, ...doms, isEAP ? cr : null])
  // )

  return {
    DOM,
    route$,
    // queue$,
  }
}
