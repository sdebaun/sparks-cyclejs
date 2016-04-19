import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div, p} from 'cycle-snabbdom'
// import {log} from 'util'

import {
  Projects,
  Engagements,
  Organizers,
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
  CardNavigating,
} from 'components/sdm'

const ManagedProjectsHeader = () => ListItem({
  classes$: just({header: true}),
  title$: just('projects you manage'),
})

const ManagedItem = sources => ProjectItem({...sources,
  subtitle$: just('owner'),
})

const ManagedList = sources => {
  const header = ManagedProjectsHeader(sources)

  const list = List({...sources,
    Control$: just(ManagedItem),
  })

  const DOM = sources.rows$.combineLatest(
    header.DOM,
    list.DOM,
    (rows, ...doms) =>
      div({}, rows.length > 0 ? doms : []),
  )

  return {
    DOM,
    route$: list.route$,
  }
}

const EngagedHeader = () => ListItem({
  classes$: just({header: true}),
  title$: just('projects you\'re involved with'),
})

const EngagedList = sources => {
  const header = EngagedHeader(sources)

  const list = List({...sources,
    Control$: just(EngagementItem),
  })

  const DOM = sources.rows$.combineLatest(
    header.DOM,
    list.DOM,
    (rows, ...doms) =>
      div({}, rows.length > 0 ? doms : []),
  )

  return {
    DOM,
    route$: list.route$,
  }
}

const OrganizingItem = sources => {
  const projectKey$ = sources.item$.pluck('projectKey')

  const project$ = projectKey$
    .flatMapLatest(Projects.query.one(sources))
    // bc ProjectItem expects its item$ to have a $key
    .combineLatest(projectKey$, (_p,$key) => ({..._p, $key}))

  return ProjectItem({...sources,
    subtitle$: sources.item$.pluck('authority'),
    item$: project$,
    path$: projectKey$.map(k => '/project/' + k),
  })
}

const OrganizingList = sources => {
  const hdr = ListItem({...sources,
    title$: just('Projects you\'re Organizing'),
    classes$: just({header: true}),
  })
  return ListWithHeader({...sources,
    headerDOM: hdr.DOM,
    Control$: just(OrganizingItem),
  })
}

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

const Welcome = sources => ({...sources,
  DOM: sources.isVisible$.map(show => show &&
    div({},`
    Welcome to the Sparks.Network!
    During our Beta, there are only a limited number opportunities,
    but anyone can apply.
    `)
  ),
})

const sparkly = require('images/pitch/sparklerHeader-2048.jpg')

const _label = ({isApplied, isAccepted, isConfirmed}) =>
  isConfirmed && 'Confirmed' ||
    isAccepted && 'Accepted' ||
      isApplied && 'Applied' ||
        'Unknown'

const acceptedCardView = sources => item =>
  div({}, [
    p({style: {fontSize: '1em', fontWeight: 'bold'}},
      'Congrats! You\'ve been accepted. Confirm to lock your spot for:'),
    ListItem({...sources,
      iconSrc$: just(item.opp.projectKey)
        .flatMapLatest(ProjectImages.query.one(sources))
        .map(i => i && i.dataUrl || '/' + sparkly),
      title$: just(div({style: {margin: 0, padding: 0}}, [
        p({style: {fontWeight: 'bold', margin: 0}}, [
          item.opp.project.name,
        ]),
        p('.subtitle', {style: {margin: 0, fontSize: '0.8em'}}, [
          `${item.opp.name} | ${_label(item)}`,
        ]),
      ])),
    }).DOM,
  ])

const AcceptedCard = sources => CardNavigating({
  ...sources,
  elevation$: just(2),
  header$: just('Confirm Now!'),
  content$: sources.item$.map(acceptedCardView(sources)),
  path$: sources.item$.map(i => `/engaged/${i.$key}/`),
})

const ConfirmationCards = sources =>
  List({
    ...sources,
    rows$: sources.isAccepted$,
    Control$: just(AcceptedCard),
  })

export default sources => {
  const projects$ = sources.userProfileKey$
    .flatMapLatest(Projects.query.byOwner(sources))

  const engagements$ = sources.userProfileKey$
    .flatMapLatest(Engagements.query.byUser(sources))

  const isAccepted$ = engagements$
    .map(engagements => engagements.filter(e => e.isAccepted))

  const confirmation = ConfirmationCards({...sources, isAccepted$})

  const organizers$ = sources.userProfileKey$
    .flatMapLatest(Organizers.query.byUser(sources))

  const welcome = Welcome({...sources,
    isVisible$: combineLatest(
      projects$, engagements$, (_p,e) => _p.length === 0 && e.length === 0
    ),
  })
  const create = isolate(CreateProjectListItem,'create')(sources)

  const managed = isolate(ManagedList,'managed')({...sources,
    rows$: projects$,
  })

  const engaged = isolate(EngagedList,'engaged')({...sources,
    rows$: engagements$,
  })

  const organizing = isolate(OrganizingList,'orgz')({...sources,
    rows$: organizers$,
  })

  const queue$ = create.project$
    .map(Projects.action.create)

  const route$ = Observable.merge(
    managed.route$,
    engaged.route$,
    organizing.route$,
    confirmation.route$,
    Projects.redirect.create(sources).route$,
  ).tap(x => console.log('route$', x))

  const DOM = combineLatest(
    sources.userProfile$.map(up => up && up.isEAP),
    create.DOM,
    confirmation.DOM,
    welcome.DOM,
    managed.DOM,
    organizing.DOM,
    engaged.DOM,
    (isEAP, cr, confirm, ...doms) =>
      div({},[confirm, ...doms, isEAP ? cr : null])
  )

  return {
    DOM,
    route$,
    queue$,
  }
}
