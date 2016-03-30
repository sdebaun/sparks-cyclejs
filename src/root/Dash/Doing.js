import {Observable} from 'rx'
const {just, combineLatest} = Observable

import isolate from '@cycle/isolate'

import {div} from 'helpers'
import {log} from 'util'

import {
  Projects,
  ProjectImages,
  Engagements,
  Organizers,
} from 'components/remote'

import {ProjectItem, ProjectForm} from 'components/project'
import {EngagementItem} from 'components/engagement'

import {
  List,
  ListWithHeader,
  ListItem,
  ListItemNavigating,
  ListItemCollapsible,
  RaisedButton,
  FlatButton,
  Dialog,
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
    .combineLatest(projectKey$, (p,$key) => ({...p, $key}))

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

export default sources => {
  const projects$ = sources.userProfileKey$
    .flatMapLatest(Projects.query.byOwner(sources))

  const engagements$ = sources.userProfileKey$
    .flatMapLatest(Engagements.query.byUser(sources))

  const organizers$ = sources.userProfileKey$
    .flatMapLatest(Organizers.query.byUser(sources))

  const welcome = Welcome({...sources,
    isVisible$: combineLatest(
      projects$, engagements$, (p,e) => p.length === 0 && e.length === 0
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
    Projects.redirect.create(sources).route$,
  )

  const DOM = combineLatest(
    welcome.DOM,
    managed.DOM,
    organizing.DOM,
    engaged.DOM,
    create.DOM,
    (...doms) => div({},doms)
  )

  return {
    DOM,
    route$,
    queue$,
  }
}
